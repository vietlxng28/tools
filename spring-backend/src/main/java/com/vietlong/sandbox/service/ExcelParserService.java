package com.vietlong.sandbox.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class ExcelParserService {

    private static final Pattern DIACRITICAL_MARKS_PATTERN = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
    private static final Pattern NON_ALPHANUMERIC_PATTERN = Pattern.compile("[^a-zA-Z0-9_]");

    public List<Map<String, Object>> parseExcel(MultipartFile file, List<Integer> columnIndexes,
            List<String> customKeys) {

        if (customKeys != null && !customKeys.isEmpty()) {
            if (columnIndexes == null || columnIndexes.isEmpty()) {
                throw new IllegalArgumentException("customKeys chỉ được sử dụng khi có columnIndexes");
            }
            if (customKeys.size() != columnIndexes.size()) {
                throw new IllegalArgumentException(
                        String.format("Độ dài customKeys (%d) phải bằng độ dài columnIndexes (%d)",
                                customKeys.size(), columnIndexes.size()));
            }
        }

        List<Map<String, Object>> jsonDataList = new ArrayList<>();

        try (InputStream inputStream = file.getInputStream();
                Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);

            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new RuntimeException("File Excel rỗng hoặc không có Header!");
            }

            Map<Integer, String> colIndexToKeyMap = buildColumnMapping(headerRow, columnIndexes, customKeys);

            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();

            int lastRowIndex = sheet.getLastRowNum();
            for (int rowIndex = 1; rowIndex <= lastRowIndex; rowIndex++) {
                Row row = sheet.getRow(rowIndex);

                Map<String, Object> jsonObject = new LinkedHashMap<>();

                for (Map.Entry<Integer, String> entry : colIndexToKeyMap.entrySet()) {
                    int colIndex = entry.getKey();
                    String jsonKey = entry.getValue();
                    Object value = null;

                    if (row != null) {
                        Cell cell = row.getCell(colIndex, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                        value = getCellValue(cell, evaluator);
                    }

                    jsonObject.put(jsonKey, value);
                }

                jsonDataList.add(jsonObject);
            }

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi xử lý file Excel: " + e.getMessage());
        }

        return jsonDataList;
    }

    private Map<Integer, String> buildColumnMapping(Row headerRow, List<Integer> requestedIndexes,
            List<String> customKeys) {
        Map<Integer, String> map = new LinkedHashMap<>();

        if (requestedIndexes == null || requestedIndexes.isEmpty()) {
            int lastCellNum = headerRow.getLastCellNum();
            for (int i = 0; i < lastCellNum; i++) {
                Cell cell = headerRow.getCell(i);
                if (cell != null) {
                    map.put(i, formatHeaderKey(cell.getStringCellValue()));
                }
            }
        }

        else {
            boolean useCustomKeys = customKeys != null && !customKeys.isEmpty();
            for (int i = 0; i < requestedIndexes.size(); i++) {
                int colIndex = requestedIndexes.get(i);
                String key;

                if (useCustomKeys) {
                    key = customKeys.get(i);
                } else {
                    Cell cell = headerRow.getCell(colIndex);
                    key = (cell != null) ? formatHeaderKey(cell.getStringCellValue()) : "UNKNOWN_COL_" + colIndex;
                }
                map.put(colIndex, key);
            }
        }
        return map;
    }

    private Object getCellValue(Cell cell, FormulaEvaluator evaluator) {
        if (cell == null)
            return null;

        switch (cell.getCellType()) {
            case STRING:
                String val = cell.getStringCellValue().trim();
                return val.isEmpty() ? null : val;

            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue();
                }
                double num = cell.getNumericCellValue();

                if (num == (long) num) {
                    return (long) num;
                }
                return num;

            case BOOLEAN:
                return cell.getBooleanCellValue();

            case FORMULA:

                return getCellValue(evaluator.evaluateInCell(cell), evaluator);

            default:
                return null;
        }
    }

    private String formatHeaderKey(String header) {
        if (header == null)
            return "UNKNOWN";

        String normalized = header.trim().toUpperCase();

        normalized = Normalizer.normalize(normalized, Normalizer.Form.NFD);
        normalized = DIACRITICAL_MARKS_PATTERN.matcher(normalized).replaceAll("");
        normalized = normalized.replace('đ', 'd').replace('Đ', 'D');

        normalized = normalized.replaceAll("\\s+", "_");

        return NON_ALPHANUMERIC_PATTERN.matcher(normalized).replaceAll("");
    }

    public byte[] jsonToExcel(List<Map<String, Object>> jsonData) {
        try (Workbook workbook = new XSSFWorkbook();
                java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Data");

            if (jsonData == null || jsonData.isEmpty()) {
                workbook.write(out);
                return out.toByteArray();
            }

           
            Set<String> headers = new LinkedHashSet<>();
            for (Map<String, Object> rowData : jsonData) {
                if (rowData != null) {
                    headers.addAll(rowData.keySet());
                }
            }
            List<String> headerList = new ArrayList<>(headers);

           
            Row headerRow = sheet.createRow(0);
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            for (int i = 0; i < headerList.size(); i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headerList.get(i));
                cell.setCellStyle(headerStyle);
            }

           
            int rowIndex = 1;
            for (Map<String, Object> rowData : jsonData) {
                Row row = sheet.createRow(rowIndex++);
                for (int i = 0; i < headerList.size(); i++) {
                    String key = headerList.get(i);
                    Object value = rowData.get(key);
                    Cell cell = row.createCell(i);
                    setCellValue(cell, value);
                }
            }

           
            for (int i = 0; i < headerList.size(); i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error generating Excel file: " + e.getMessage());
        }
    }

    private void setCellValue(Cell cell, Object value) {
        if (value == null) {
            cell.setBlank();
        } else if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else if (value instanceof Boolean) {
            cell.setCellValue((Boolean) value);
        } else {
            cell.setCellValue(value.toString());
        }
    }

    public byte[] updateFormulaInExcel(MultipartFile file, String sourceCol, String targetCol, String formulaCol) {
        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream);
             java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {

            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new RuntimeException("File Excel rỗng hoặc không có Header!");
            }

            int sourceIdx = -1;
            int targetIdx = -1;
            int formulaIdx = -1;

            String formattedSourceCol = formatHeaderKey(sourceCol);
            String formattedTargetCol = formatHeaderKey(targetCol);
            String formattedFormulaCol = formatHeaderKey(formulaCol);

            int lastCellNum = headerRow.getLastCellNum();
            for (int i = 0; i < lastCellNum; i++) {
                Cell cell = headerRow.getCell(i);
                if (cell != null) {
                    String headerVal = cell.getStringCellValue().trim();
                    String formattedVal = formatHeaderKey(headerVal);
                    if (formattedVal.equalsIgnoreCase(formattedSourceCol)) {
                        sourceIdx = i;
                    }
                    if (formattedVal.equalsIgnoreCase(formattedTargetCol)) {
                        targetIdx = i;
                    }
                    if (formattedVal.equalsIgnoreCase(formattedFormulaCol)) {
                        formulaIdx = i;
                    }
                }
            }

            if (sourceIdx == -1 || targetIdx == -1 || formulaIdx == -1) {
                throw new IllegalArgumentException(String.format(
                        "Không tìm thấy đủ các cột yêu cầu trong file Excel! Cần các cột: %s (matched %d), %s (matched %d), %s (matched %d)",
                        sourceCol, sourceIdx, targetCol, targetIdx, formulaCol, formulaIdx));
            }

            Map<String, String> mapping = new HashMap<>();
            int lastRowIndex = sheet.getLastRowNum();
            for (int rowIndex = 1; rowIndex <= lastRowIndex; rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null) continue;

                Cell sourceCell = row.getCell(sourceIdx);
                Cell targetCell = row.getCell(targetIdx);
                if (sourceCell == null || targetCell == null) continue;

                String srcVal = getCellStringValue(sourceCell);
                String tgtVal = getCellStringValue(targetCell);

                if (srcVal != null && !srcVal.isEmpty() && tgtVal != null && !tgtVal.isEmpty()) {
                    mapping.put(srcVal, tgtVal);
                }
            }

            int newFormulaIdx = lastCellNum;

            Cell newHeaderCell = headerRow.createCell(newFormulaIdx);
            newHeaderCell.setCellValue(formulaCol + "_NEW");

            Cell oldHeaderCell = headerRow.getCell(formulaIdx);
            if (oldHeaderCell != null) {
                newHeaderCell.setCellStyle(oldHeaderCell.getCellStyle());
            }

            List<String> sortedKeys = new ArrayList<>(mapping.keySet());
            sortedKeys.sort((a, b) -> Integer.compare(b.length(), a.length()));

            for (int rowIndex = 1; rowIndex <= lastRowIndex; rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null) {
                    continue;
                }

                Cell formulaCell = row.getCell(formulaIdx);
                String formulaVal = "";

                if (formulaCell != null) {
                    CellType type = formulaCell.getCellType();
                    if (type == CellType.FORMULA) {
                        try {
                            formulaVal = formulaCell.getCellFormula().trim();
                        } catch (Exception e) {
                            try {
                                formulaVal = formulaCell.getStringCellValue().trim();
                            } catch (Exception ex) {
                                formulaVal = "";
                            }
                        }
                    } else if (type == CellType.STRING) {
                        formulaVal = formulaCell.getStringCellValue().trim();
                    } else if (type == CellType.NUMERIC) {
                        double num = formulaCell.getNumericCellValue();
                        if (num == (long) num) {
                            formulaVal = String.valueOf((long) num);
                        } else {
                            formulaVal = String.valueOf(num);
                        }
                    } else if (type == CellType.BOOLEAN) {
                        formulaVal = String.valueOf(formulaCell.getBooleanCellValue());
                    }
                } else {

                    formulaVal = "";
                }

                Cell newCell = row.createCell(newFormulaIdx);
                if (formulaCell != null) {
                    newCell.setCellStyle(formulaCell.getCellStyle());
                }

                if (formulaVal.isEmpty()) {
                    newCell.setCellValue("");
                    continue;
                }

                String newFormula = formulaVal;
                for (String srcKey : sortedKeys) {
                    String targetValue = mapping.get(srcKey);
                    String regex = "(?<!\\w)" + Pattern.quote(srcKey) + "(?!\\w)";
                    newFormula = newFormula.replaceAll(regex, targetValue);
                }

                newCell.setCellValue(newFormula);
            }

            sheet.autoSizeColumn(newFormulaIdx);

            workbook.write(out);
            return out.toByteArray();
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi cập nhật công thức Excel: " + e.getMessage());
        }
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return "";
        CellType type = cell.getCellType();
        if (type == CellType.FORMULA) {

            try {
                return cell.getCellFormula().trim();
            } catch (Exception e) {
                type = cell.getCachedFormulaResultType();
            }
        }

        switch (type) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                double num = cell.getNumericCellValue();
                if (num == (long) num) {
                    return String.valueOf((long) num);
                }
                return String.valueOf(num);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return "";
        }
    }
}