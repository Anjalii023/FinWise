import { request } from './client';

export interface UploadResponse {
  status: string;
  format: string;
  confidence: number;
  transactionCount: number;
  totalDebits: number;
  totalCredits: number;
}

export interface ConfirmStatementResponse {
  status: string;
  datasetName: string;
  importedCount: number;
  message: string;
}

export const statementApi = {
  async upload(fileMeta: { name: string; size: number }): Promise<UploadResponse> {
    return request<UploadResponse>('/upload', {
      method: 'POST',
      body: JSON.stringify(fileMeta),
    });
  },

  async confirm(datasetName: string, transactionCount: number): Promise<ConfirmStatementResponse> {
    return request<ConfirmStatementResponse>('/upload/confirm', {
      method: 'POST',
      body: JSON.stringify({ datasetName, transactionCount }),
    });
  },
};
