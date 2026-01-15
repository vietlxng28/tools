import React, { useState } from 'react';
import { Button, message, Select, Typography, Space } from 'antd';
import { EyeOutlined, CopyOutlined, DownloadOutlined, ExpandOutlined, AimOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons';
import mermaid from 'mermaid';
import PageContainer from '../components/PageContainer';
import SectionCard from '../components/SectionCard';
import CodeInput from '../components/CodeInput';

const { Text } = Typography;

const DIAGRAM_TYPES = [
  { value: 'flowchart', label: 'Flowchart' },
  { value: 'sequence', label: 'Sequence Diagram' },
  { value: 'class', label: 'Class Diagram' },
  { value: 'state', label: 'State Diagram' },
  { value: 'entity', label: 'ER Diagram' },
  { value: 'gantt', label: 'Gantt Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'mindmap', label: 'Mind Map' },
];

const DEFAULT_EXAMPLES: Record<string, string> = {
  flowchart: `graph TD
    A[Start] --> B{Is it?}
    B -->|Yes| C[OK]
    B -->|No| D[End]
    C --> D`,
  sequence: `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello Bob!
    Bob->>Alice: Hi Alice!`,
  class: `classDiagram
    class Animal {
      +String name
      +makeSound()
    }
    class Dog {
      +bark()
    }
    Animal <|-- Dog`,
  state: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Done
    Done --> [*]`,
  entity: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    CUSTOMER {
      int id PK
      string name
    }`,
  gantt: `gantt
    title Project Schedule
    dateFormat YYYY-MM-DD
    section Phase 1
    Task 1: 2024-01-01, 7d
    Task 2: 2024-01-08, 5d
    section Phase 2
    Task 3: 2024-01-13, 10d`,
  pie: `pie title Browser Market Share
    "Chrome": 60
    "Firefox": 25
    "Safari": 15`,
  mindmap: `mindmap
  root((Main Topic))
    Topic 1
      Subtopic A
      Subtopic B
    Topic 2
      Subtopic C
      Subtopic D`,
};

let diagramIdCounter = 0;

const MermaidViewer: React.FC = () => {
  const [inputData, setInputData] = useState('');
  const [result, setResult] = useState('');
  const [selectedType, setSelectedType] = useState('flowchart');
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleRender = async () => {
    if (!inputData.trim()) {
      message.warning('Vui lòng nhập mã Mermaid!');
      return;
    }

    setError(null);
    try {
      const id = `mermaid-${++diagramIdCounter}`;
      const { svg } = await mermaid.render(id, inputData);
      setResult(svg);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      message.success('Đã render diagram!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      setError(errorMessage);
      setResult('');
      message.error('Lỗi khi render Mermaid!');
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isFullscreen) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (!isFullscreen) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.min(Math.max(prev * delta, 0.1), 5));
  };

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.1));
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleLoadExample = () => {
    setInputData(DEFAULT_EXAMPLES[selectedType] || '');
    setError(null);
    setResult('');
  };

  const handleCopySvg = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      message.success('Đã copy SVG!');
    }
  };

  const handleDownloadSvg = () => {
    if (result) {
      const blob = new Blob([result], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diagram.svg';
      a.click();
      URL.revokeObjectURL(url);
      message.success('Đã download SVG!');
    }
  };

  const handleDownloadPng = async () => {
    if (result) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          canvas.width = img.width * 2;
          canvas.height = img.height * 2;
          ctx?.scale(2, 2);
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'diagram.png';
              a.click();
              URL.revokeObjectURL(url);
              message.success('Đã download PNG!');
            }
          }, 'image/png');
        };
        const svgBlob = new Blob([result], { type: 'image/svg+xml' });
        img.src = URL.createObjectURL(svgBlob);
      } catch {
        message.error('Không thể convert sang PNG!');
      }
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    handleReset();
  };

  if (isFullscreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#fdf6e3',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            padding: '12px 16px',
            background: '#eee8d5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #d9c9a3',
          }}
        >
          <Text strong style={{ fontSize: 16 }}>Diagram Viewer - Focus Mode</Text>
          <Space>
            <Button onClick={handleZoomOut}>-</Button>
            <Text style={{ minWidth: 50, textAlign: 'center' }}>{Math.round(scale * 100)}%</Text>
            <Button onClick={handleZoomIn}>+</Button>
            <Button icon={<AimOutlined />} onClick={handleReset}>Reset</Button>
            <Button icon={<CopyOutlined />} onClick={handleCopySvg}>Copy</Button>
            <Button icon={<DownloadOutlined />} onClick={handleDownloadSvg}>SVG</Button>
            <Button type="primary" icon={<FullscreenExitOutlined />} onClick={toggleFullscreen}>Exit</Button>
          </Space>
        </div>
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
        >
          <div
            dangerouslySetInnerHTML={{ __html: result }}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.1s ease',
              userSelect: 'none',
              background: '#fff',
              padding: 24,
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          />
        </div>
        <div style={{ padding: '8px 16px', background: '#eee8d5', textAlign: 'center' }}>
          <Text type="secondary">Kéo để di chuyển • Scroll để zoom • Nút +/- để điều chỉnh zoom</Text>
        </div>
      </div>
    );
  }

  return (
    <PageContainer
      title="Mermaid Diagram Viewer"
      icon={<EyeOutlined />}
      footerText="Chuyển đổi mã Mermaid thành sơ đồ trực quan. Hỗ trợ flowchart, sequence, class, state, ER, gantt, pie, mindmap."
    >
      <SectionCard>
        <Space style={{ width: '100%' }} direction="vertical" size="middle">
          <Space>
            <Text strong>Loại diagram:</Text>
            <Select
              value={selectedType}
              onChange={(value) => {
                setSelectedType(value);
                setInputData(DEFAULT_EXAMPLES[value] || '');
              }}
              options={DIAGRAM_TYPES}
              style={{ width: 200 }}
            />
            <Button onClick={handleLoadExample} icon={<ExpandOutlined />}>Load Example</Button>
          </Space>
          <Text type="secondary">Chọn loại diagram và click "Load Example" để xem ví dụ, hoặc nhập mã Mermaid của bạn.</Text>
        </Space>
      </SectionCard>

      <CodeInput
        label="Nhập mã Mermaid:"
        value={inputData}
        onChange={(value) => { setInputData(value); setError(null); }}
        onClear={() => { setInputData(''); setResult(''); setError(null); }}
        placeholder="Nhập mã Mermaid vào đây..."
      />

      <Button
        type="primary"
        icon={<EyeOutlined />}
        size="large"
        block
        onClick={handleRender}
        disabled={!inputData.trim()}
        style={{ marginTop: 16, marginBottom: 16 }}
      >
        Render Diagram
      </Button>

      {error && (
        <SectionCard style={{ background: '#fff2f0', border: '1px solid #ffccc7' }}>
          <Text type="danger" strong>Lỗi parse Mermaid:</Text>
          <pre style={{ margin: '8px 0 0 0', fontSize: 12, color: '#ff4d4f' }}>{error}</pre>
        </SectionCard>
      )}

      {result && (
        <SectionCard>
          <Space style={{ marginBottom: 16 }} wrap align="center">
            <Text strong>Preview:</Text>
            <Button type="primary" icon={<FullscreenOutlined />} onClick={toggleFullscreen}>Focus</Button>
            <Button icon={<CopyOutlined />} onClick={handleCopySvg}>Copy SVG</Button>
            <Button icon={<DownloadOutlined />} onClick={handleDownloadSvg}>SVG</Button>
            <Button icon={<DownloadOutlined />} onClick={handleDownloadPng}>PNG</Button>
          </Space>
          <div
            style={{
              overflow: 'auto',
              maxHeight: 600,
              background: '#fafafa',
              borderRadius: 8,
              border: '1px solid #d9d9d9',
              textAlign: 'center',
              padding: 16,
            }}
          >
            <div dangerouslySetInnerHTML={{ __html: result }} />
          </div>
        </SectionCard>
      )}

      <SectionCard title="Hướng dẫn nhanh">
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Text><Text code>graph TD</Text> hoặc <Text code>graph LR</Text> - Flowchart (trên/xuống hoặc trái/phải)</Text>
          <Text><Text code>sequenceDiagram</Text> - Sequence diagram</Text>
          <Text><Text code>classDiagram</Text> - Class diagram</Text>
          <Text><Text code>stateDiagram-v2</Text> - State diagram</Text>
          <Text><Text code>erDiagram</Text> - ER diagram</Text>
          <Text><Text code>gantt</Text> - Gantt chart</Text>
          <Text><Text code>pie</Text> - Pie chart</Text>
          <Text><Text code>mindmap</Text> - Mind map</Text>
        </Space>
      </SectionCard>
    </PageContainer>
  );
};

export default MermaidViewer;
