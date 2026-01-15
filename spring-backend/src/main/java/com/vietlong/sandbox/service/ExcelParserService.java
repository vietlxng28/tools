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
}