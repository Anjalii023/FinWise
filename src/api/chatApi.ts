import { request } from './client';

export interface ChatApiRequest {
  prompt: string;
  queryClass?: string;
  explanationLevel?: string;
}

export interface ChatApiResponse {
  answer: string | null;
  model: string;
  fallback?: boolean;
  message?: string;
}

export const chatApi = {
  async sendMessage(payload: ChatApiRequest): Promise<ChatApiResponse> {
    return request<ChatApiResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
