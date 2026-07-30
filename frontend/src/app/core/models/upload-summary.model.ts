export interface UploadRowError {
  row: number;
  message: string;
}

export interface UploadSummary {
  totalRows: number;
  successCount: number;
  failedCount: number;
  errors: UploadRowError[];
}