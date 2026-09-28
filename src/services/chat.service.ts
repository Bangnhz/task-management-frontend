import api from './api';

export interface ChatRequestDTO {
  message: string;
}

export interface ChatResponseDTO {
  reply: string;
}

const ChatService = {
  sendMessage: (message: string) =>
    api.post<ChatResponseDTO>('/chat', { message }, { timeout: 60_000 }),
};

export default ChatService;
