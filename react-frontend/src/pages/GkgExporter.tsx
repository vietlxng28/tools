import React, { useState, useEffect } from 'react';
import { Select, Input, Button, Table, Card, Spin, message, Typography, InputNumber, Row, Col, Checkbox } from 'antd';
import { SearchOutlined, CodeOutlined, BranchesOutlined, ExportOutlined, ReloadOutlined } from '@ant-design/icons';
import PageContainer from '../components/PageContainer';
import SectionCard from '../components/SectionCard';
import CodeDisplay from '../components/CodeDisplay';

const { Text, Paragraph } = Typography;

const GKG_URL = '/mcp-api';

interface Definition {
  name: string;
  file_path: string;
  signature?: string;
  type?: string;
}

interface DependencyInfo {
  name: string;
  file: string;
  code: string;
}

const decodeHtmlEntities = (str: string): string => {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&#39;': "'"
  };
  return str.replace(/&amp;|&lt;|&gt;|&quot;|&#039;|&#39;/g, (m) => map[m] || m);
};

const extractXmlTag = (xml: string, tagName: string): string => {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`);
  const match = regex.exec(xml);
  return match ? decodeHtmlEntities(match[1]) : '';
};

const extractXmlTags = (xml: string, tagName: string): string[] => {
  const regex = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, 'g');
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(xml)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};

const GkgExporter: React.FC = () => {
  const [projects, setProjects] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loadingProjects, setLoadingProjects] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Definition[]>([]);
  const [maxDepth, setMaxDepth] = useState<number>(2);
  const [reindexing, setReindexing] = useState<boolean>(false);
  const [quickSearchText, setQuickSearchText] = useState<string>('');
  const [quickSearchType, setQuickSearchType] = useState<string>('all');

  const [exporting, setExporting] = useState<boolean>(false);
  const [targetFunction, setTargetFunction] = useState<string>('');
  const [dependencies, setDependencies] = useState<Record<string, DependencyInfo>>({});
  const [selectedDeps, setSelectedDeps] = useState<string[]>([]);
  const [consolidatedMarkdown, setConsolidatedMarkdown] = useState<string>('');

  const handleReindex = async () => {
    if (!selectedProject) {
      message.warning('Vui lòng chọn một dự án!');
      return;
    }
    setReindexing(true);
    try {
      await callGkgMcp('index_project', {
        project_absolute_path: selectedProject
      });
      message.success('Đã gửi yêu cầu Reindex thành công! Hệ thống GKG đang làm mới chỉ mục dự án.');
    } catch (error: any) {
      message.error('Lỗi khi Reindex dự án: ' + error.message);
    } finally {
      setReindexing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getFileName = (path: string) => path.split('/').pop() || path;

  const callGkgMcp = async (toolName: string, args: Record<string, any>): Promise<string> => {

    const initRes = await fetch(GKG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: { name: 'react-frontend-client', version: '1.0.0' }
        }
      })
    });

    if (!initRes.ok) {
      throw new Error(`GKG Server init returned status ${initRes.status}`);
    }

    const sessionId = initRes.headers.get('mcp-session-id');
    if (!sessionId) {
      throw new Error('Failed to retrieve mcp-session-id from GKG headers. Check CORS expose settings.');
    }

    await fetch(GKG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'mcp-session-id': sessionId
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'notifications/initialized',
        params: {}
      })
    });

    const toolCallRes = await fetch(GKG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
        'mcp-session-id': sessionId
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      })
    });

    if (!toolCallRes.ok) {
      throw new Error(`GKG Tool Call returned status ${toolCallRes.status}`);
    }

    const text = await toolCallRes.text();
    const lines = text.split('\n');
    const dataLine = lines.find(line => line.trim().startsWith('data: '));
    if (!dataLine) {
      throw new Error(`Không tìm thấy dòng dữ liệu trong phản hồi GKG: ${text}`);
    }
    const jsonText = dataLine.trim().substring(6).trim();
    const json = JSON.parse(jsonText);
    if (json.error) {
      throw new Error(`GKG MCP Error: ${JSON.stringify(json.error)}`);
    }

    const contentText = json?.result?.content?.[0]?.text;
    if (!contentText) {
      throw new Error('No content returned from GKG MCP tool');
    }

    return contentText;
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const xmlString = await callGkgMcp('list_projects', {});
      const paths = extractXmlTags(xmlString, 'project_path').filter(p => p !== '');

      setProjects(paths);
      if (paths.length > 0) {
        setSelectedProject(paths[0]);
      }
    } catch (error: any) {
      message.error('Không thể kết nối GKG MCP: ' + error.message);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedProject) {
      message.warning('Vui lòng chọn một dự án!');
      return;
    }
    if (!searchTerm.trim()) {
      message.warning('Vui lòng nhập từ khóa tìm kiếm!');
      return;
    }

    setSearching(true);
    setSearchResults([]);
    setQuickSearchText('');
    try {
      const xmlString = await callGkgMcp('search_codebase_definitions', {
        project_absolute_path: selectedProject,
        search_terms: [searchTerm.trim()],
        page: 1
      });

      const defBlocks = extractXmlTags(xmlString, 'definition');

      const parsedDefs: Definition[] = defBlocks.map(block => {
        const location = extractXmlTag(block, 'location');
        const filePath = location.includes(':') ? location.substring(0, location.lastIndexOf(':')) : location;
        return {
          name: extractXmlTag(block, 'name'),
          file_path: filePath,
          type: extractXmlTag(block, 'definition-type'),
          signature: extractXmlTag(block, 'context')
        };
      });

      setSearchResults(parsedDefs);
      if (parsedDefs.length === 0) {
        message.info('Không tìm thấy định nghĩa nào!');
      }
    } catch (error: any) {
      message.error('Lỗi khi tìm kiếm: ' + error.message);
    } finally {
      setSearching(false);
    }
  };

  const extractFunctionCalls = (code: string): string[] => {
    const calls: string[] = [];
    const pattern = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
    let match;
    const commonKeywords = new Set([
      'if', 'for', 'while', 'switch', 'catch', 'require', 'import', 'define', 'log', 'error', 'warn',
      'super', 'this', 'new', 'return', 'class', 'function', 'const', 'let', 'var', 'void', 'public', 'private', 'protected'
    ]);
    const commonMethods = new Set([
      'get', 'set', 'size', 'length', 'add', 'remove', 'clear', 'put', 'contains', 'equals', 'hashCode',
      'toString', 'clone', 'split', 'join', 'map', 'filter', 'forEach', 'reduce', 'find', 'indexOf',
      'push', 'pop', 'shift', 'unshift', 'substring', 'toLowerCase', 'toUpperCase', 'trim', 'replace',
      'replaceAll', 'match', 'test', 'exec', 'next', 'isPresent', 'isEmpty', 'orElse', 'orElseGet',
      'orElseThrow', 'stream', 'collect', 'asList', 'save', 'saveAll', 'delete', 'deleteAll',
      'findById', 'findAll', 'count', 'existsById', 'builder', 'build', 'create', 'newInstance',
      'valueOf', 'parse', 'format', 'ok', 'body', 'status', 'headers', 'then', 'finally',
      'resolve', 'reject', 'print', 'println', 'write', 'read', 'post', 'get', 'put', 'delete',
      'of', 'map', 'orElse', 'flatMap', 'filter', 'anyMatch', 'allMatch', 'noneMatch'
    ]);

    while ((match = pattern.exec(code)) !== null) {
      const name = match[1];
      if (!commonKeywords.has(name) && !commonMethods.has(name) && !calls.includes(name)) {
        calls.push(name);
      }
    }
    return calls;
  };

  const handleExport = async (definition: Definition) => {
    setExporting(true);
    setTargetFunction(definition.name);
    setDependencies({});
    setSelectedDeps([]);
    setConsolidatedMarkdown('');

    const resolvedDeps: Record<string, DependencyInfo> = {};
    const visited = new Set<string>();

    const traceDependencies = async (name: string, filePath: string, depth: number) => {
      if (depth > maxDepth || visited.has(name)) return;
      visited.add(name);

      try {
        let resolvedFilePath = filePath;
        if (!resolvedFilePath) {
          const searchXml = await callGkgMcp('search_codebase_definitions', {
            project_absolute_path: selectedProject,
            search_terms: [name],
            page: 1
          });
          const defBlocks = extractXmlTags(searchXml, 'definition');
          if (defBlocks.length > 0) {
            const location = extractXmlTag(defBlocks[0], 'location');
            resolvedFilePath = location.includes(':') ? location.substring(0, location.lastIndexOf(':')) : location;
          }
        }

        if (!resolvedFilePath) return;

        const readXml = await callGkgMcp('read_definitions', {
          definitions: [{
            file_path: resolvedFilePath,
            names: [name]
          }]
        });

        const defBlocks = extractXmlTags(readXml, 'definition');
        if (defBlocks.length > 0) {
          const code = extractXmlTag(defBlocks[0], 'definition-body');
          resolvedDeps[name] = {
            name,
            file: resolvedFilePath,
            code
          };

          const calls = extractFunctionCalls(code);
          for (const childCall of calls) {
            if (childCall === name) continue;
            const childSearchXml = await callGkgMcp('search_codebase_definitions', {
              project_absolute_path: selectedProject,
              search_terms: [childCall],
              page: 1
            });
            const childDefBlocks = extractXmlTags(childSearchXml, 'definition');

            let bestDefBlock = '';
            for (const block of childDefBlocks) {
              const loc = extractXmlTag(block, 'location');
              const nodeFilePath = loc.includes(':') ? loc.substring(0, loc.lastIndexOf(':')) : loc;
              if (nodeFilePath === resolvedFilePath) {
                bestDefBlock = block;
                break;
              }
            }
            if (!bestDefBlock && childDefBlocks.length > 0) {
              bestDefBlock = childDefBlocks[0];
            }

            if (bestDefBlock) {
              const location = extractXmlTag(bestDefBlock, 'location');
              const childFilePath = location.includes(':') ? location.substring(0, location.lastIndexOf(':')) : location;
              await traceDependencies(childCall, childFilePath, depth + 1);
            }
          }
        }
      } catch (err) {
        console.error(`Error tracing ${name}:`, err);
      }
    };

    try {
      await traceDependencies(definition.name, definition.file_path, 0);
      setDependencies(resolvedDeps);
      const depNames = Object.keys(resolvedDeps);
      setSelectedDeps(depNames);
      updateConsolidatedCode(resolvedDeps, depNames, definition.name);
      message.success('Đã tải thành công mã nguồn và các phụ thuộc!');
    } catch (error: any) {
      message.error('Lỗi khi xuất mã nguồn: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const updateConsolidatedCode = (deps: Record<string, DependencyInfo>, activeDeps: string[], target: string) => {
    if (!deps || Object.keys(deps).length === 0) return;

    const parts: string[] = [`# Source Code Bundle: ${target}\n`];

    if (activeDeps.includes(target) && deps[target]) {
      const dep = deps[target];
      parts.push(`## [Target] ${target} (${getFileName(dep.file)})\n\`\`\`${detectLanguage(dep.file)}\n${dep.code}\n\`\`\`\n`);
    }

    const hasDeps = activeDeps.some(name => name !== target);
    if (hasDeps) {
      parts.push(`## Dependencies`);
      activeDeps.forEach(name => {
        if (name === target) return;
        const dep = deps[name];
        if (dep) {
          parts.push(`### ${name} (${getFileName(dep.file)})\n\`\`\`${detectLanguage(dep.file)}\n${dep.code}\n\`\`\`\n`);
        }
      });
    }

    setConsolidatedMarkdown(parts.join('\n\n'));
  };

  const detectLanguage = (filePath: string): string => {
    const lowercase = filePath.toLowerCase();
    if (lowercase.endsWith('.java')) return 'java';
    if (lowercase.endsWith('.js')) return 'javascript';
    if (lowercase.endsWith('.ts')) return 'typescript';
    if (lowercase.endsWith('.tsx')) return 'tsx';
    if (lowercase.endsWith('.jsx')) return 'jsx';
    if (lowercase.endsWith('.py')) return 'python';
    if (lowercase.endsWith('.go')) return 'go';
    if (lowercase.endsWith('.sql')) return 'sql';
    return '';
  };

  const handleCheckboxChange = (checkedValues: any[]) => {
    setSelectedDeps(checkedValues);
    updateConsolidatedCode(dependencies, checkedValues, targetFunction);
  };

  const columns = [
    {
      title: 'Tên Ký hiệu',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong><CodeOutlined style={{ marginRight: 8, color: '#1890ff' }} />{text}</Text>
    },
    {
      title: 'Đường dẫn File',
      dataIndex: 'file_path',
      key: 'file_path',
      render: (text: string) => <Text type="secondary">{text}</Text>
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 180,
      render: (text: string) => <Text code>{text || 'Method/Function'}</Text>
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      render: (_: any, record: Definition) => (
          <Button
              type="primary"
              icon={<BranchesOutlined />}
              onClick={() => handleExport(record)}
          >
            Phân tích & Xuất
          </Button>
      )
    }
  ];

  const filteredResults = searchResults.filter(item => {
    if (!quickSearchText.trim()) return true;
    const text = quickSearchText.toLowerCase();
    
    if (quickSearchType === 'name') {
      return item.name.toLowerCase().includes(text);
    }
    if (quickSearchType === 'file_path') {
      return item.file_path.toLowerCase().includes(text);
    }
    if (quickSearchType === 'type') {
      const typeStr = item.type || 'Method/Function';
      return typeStr.toLowerCase().includes(text);
    }
    
    const typeStr = item.type || 'Method/Function';
    return item.name.toLowerCase().includes(text) ||
           item.file_path.toLowerCase().includes(text) ||
           typeStr.toLowerCase().includes(text);
  });

  return (
      <PageContainer title="GKG MCP Exporter" icon={<ExportOutlined />}>
        <SectionCard title="Cấu hình tìm kiếm GKG">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <div style={{ marginBottom: 12 }}>
                <Text strong>Chọn Dự án (indexed in GKG):</Text>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Select
                      showSearch
                      style={{ flex: 1, minWidth: 0 }}
                      placeholder="Chọn một project..."
                      loading={loadingProjects}
                      value={selectedProject}
                      onChange={setSelectedProject}
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                          String(option?.children ?? '').toLowerCase().includes(input.toLowerCase()) ||
                          String(option?.value ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                  >
                    {projects.map(path => (
                        <Select.Option key={path} value={path}>
                          {`${getFileName(path)} (${path})`}
                        </Select.Option>
                    ))}
                  </Select>
                  <Button
                      icon={<ReloadOutlined />}
                      onClick={handleReindex}
                      loading={reindexing}
                      disabled={!selectedProject}
                  >
                    Reindex
                  </Button>
                </div>
              </div>
            </Col>
            <Col xs={24} md={6}>
              <div style={{ marginBottom: 12 }}>
                <Text strong>Độ sâu phụ thuộc tối đa:</Text>
                <div style={{ marginTop: 8 }}>
                  <InputNumber
                      min={1}
                      max={5}
                      value={maxDepth}
                      onChange={(val) => setMaxDepth(val || 2)}
                      style={{ width: '100%' }}
                  />
                </div>
              </div>
            </Col>
            <Col xs={24} md={6}>
              <div style={{ marginBottom: 12 }}>
                <Text strong>Tìm kiếm Hàm/Lớp:</Text>
                <Input.Search
                    style={{ marginTop: 8 }}
                    placeholder="Ví dụ: parseExcel, DataCleaner..."
                    enterButton={<SearchOutlined />}
                    loading={searching}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={handleSearch}
                />
              </div>
            </Col>
          </Row>
        </SectionCard>

        {searchResults.length > 0 && (
            <SectionCard title="Kết quả tìm kiếm định nghĩa">
              <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Text strong>Lọc nhanh kết quả:</Text>
                <Input
                    placeholder="Nhập từ khóa cần lọc..."
                    value={quickSearchText}
                    onChange={(e) => setQuickSearchText(e.target.value)}
                    style={{ width: 250 }}
                    allowClear
                />
                <Select
                    value={quickSearchType}
                    onChange={setQuickSearchType}
                    style={{ width: 180 }}
                >
                  <Select.Option value="all">Tất cả các trường</Select.Option>
                  <Select.Option value="name">Tên Ký hiệu</Select.Option>
                  <Select.Option value="file_path">Đường dẫn File</Select.Option>
                  <Select.Option value="type">Loại</Select.Option>
                </Select>
                <Text type="secondary" style={{ marginLeft: 'auto' }}>
                  Tìm thấy: {filteredResults.length} / {searchResults.length}
                </Text>
              </div>
              <Table
                  dataSource={filteredResults}
                  columns={columns}
                  rowKey={(record) => `${record.file_path}-${record.name}`}
                  pagination={{ pageSize: 5 }}
                  bordered
              />
            </SectionCard>
        )}

        {exporting && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" tip="Đang đệ quy phân tích mã nguồn và các phụ thuộc..." />
            </div>
        )}

        {Object.keys(dependencies).length > 0 && !exporting && (
            <Row gutter={16}>
              <Col xs={24} lg={8}>
                <SectionCard title="Cây phụ thuộc (Dependencies)">
                  <Paragraph>
                    Tìm thấy <Text strong>{Object.keys(dependencies).length}</Text> hàm/lớp liên quan. Tích chọn các phần bạn muốn xuất:
                  </Paragraph>
                  <Checkbox.Group
                      style={{ width: '100%', flexDirection: 'column' }}
                      value={selectedDeps}
                      onChange={handleCheckboxChange}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                      {Object.entries(dependencies).map(([name, info]) => (
                          <Card
                              size="small"
                              key={name}
                              style={{ width: '100%', borderLeft: name === targetFunction ? '4px solid #1890ff' : '1px solid #d9d9d9' }}
                              variant={name === targetFunction ? 'outlined' : 'borderless'}
                          >
                            <Checkbox value={name}>
                              <Text strong style={{ color: name === targetFunction ? '#1890ff' : 'inherit' }}>
                                {name}
                              </Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: '11px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                                {getFileName(info.file)}
                              </Text>
                            </Checkbox>
                          </Card>
                      ))}
                    </div>
                  </Checkbox.Group>
                </SectionCard>
              </Col>

              <Col xs={24} lg={16}>
                <SectionCard
                    title={`Mã nguồn gộp: ${targetFunction}`}

                >
                  {consolidatedMarkdown ? (
                      <CodeDisplay
                          title="Source Code Bundle (Markdown)"
                          content={consolidatedMarkdown}
                          isPre={true}
                      />
                  ) : (
                      <Text type="secondary">Vui lòng chọn ít nhất một phần mã nguồn để hiển thị.</Text>
                  )}
                </SectionCard>
              </Col>
            </Row>
        )}
      </PageContainer>
  );
};

export default GkgExporter;