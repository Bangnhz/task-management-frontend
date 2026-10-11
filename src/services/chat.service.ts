import api from './api';

export interface ChatRequestDTO {
  message: string;
}

export interface ChatResponseDTO {
  reply?: string;
  error?: string;
}

const ChatService = {
  sendMessage: (message: string) =>
    api.post<ChatResponseDTO>('/chat', { message }, { timeout: 60_000 }),

  uploadAndCreateTasks: (files: File[], message?: string, projectId?: string | number) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (message && message.trim()) {
      formData.append('message', message.trim());
    }

    const headers: Record<string, string> = {
      'Content-Type': 'multipart/form-data',
    };
    if (projectId) {
      headers['X-Project-Id'] = projectId.toString();
    }

    return api.post<ChatResponseDTO>('/chat/upload-and-create', formData, {
      headers,
      timeout: 120_000,
    });
  },
};

export default ChatService;

