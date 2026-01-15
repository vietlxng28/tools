import type { ApiConfig } from "./apiService";

export const ENDPOINT: Record<string, ApiConfig> = {
  USER: {
    endpoint: "/users",
    method: "GET",
  },
  UPLOAD_EXCEL: {
    endpoint: "/api/excel/parse-to-json",
    method: "POST",
    headers: { "Content-Type": "multipart/form-data" },
  },
  JSON_TO_EXCEL: {
    endpoint: "/api/excel/json-to-excel",
    method: "POST",
    headers: { "Content-Type": "application/json" },
  },
};
