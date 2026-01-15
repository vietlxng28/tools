package com.vietlong.sandbox.controller;

import com.vietlong.sandbox.service.ExcelParserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Tag(name = "Excel Parser", description = "API xử lý file Excel và chuyển đổi sang JSON động")
@RestController
@RequestMapping("/api/excel")
public class ExcelController {

    @Autowired
    private ExcelParserService excelParserService;

    @Operation(summary = "Upload và parse file Excel")
    @PostMapping(value = "/parse-to-json", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAndParseExcelToJson(
            @Parameter(description = "File Excel cần parse (.xlsx)", content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)) @RequestPart("file") MultipartFile file,

            @Parameter(description = "Danh sách index cột cần lấy (bắt đầu từ 0).") @RequestParam(value = "columnIndexes", required = false) List<Integer> columnIndexes,

            @Parameter(description = "Danh sách tên key JSON tùy chỉnh.") @RequestParam(value = "customKeys", required = false) List<String> customKeys) {

        if (file.isEmpty() || file.getOriginalFilename() == null || !file.getOriginalFilename().endsWith(".xlsx")) {
            return ResponseEntity.badRequest().body("File không hợp lệ. Vui lòng upload file .xlsx");
        }

        try {

            List<Map<String, Object>> result = excelParserService.parseExcel(file, columnIndexes, customKeys);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    @Operation(summary = "Convert JSON to Excel")
    @PostMapping(value = "/json-to-excel")
    public ResponseEntity<?> convertJsonToExcel(@RequestBody List<Map<String, Object>> jsonData) {
        try {
            byte[] excelBytes = excelParserService.jsonToExcel(jsonData);

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=data.xlsx")
                    .contentType(MediaType
                            .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excelBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}