import api from './api';
import { CommentRequestDTO, CommentResponseDTO } from '../types/comment';

const CommentService = {
  getCommentsByTask: (taskId: number) =>
    api.get<CommentResponseDTO[]>(`/tasks/${taskId}/comments`),

  createComment: (taskId: number, body: CommentRequestDTO) =>
    api.post<CommentResponseDTO>(`/tasks/${taskId}/comments`, body),

  
};

export default CommentService;