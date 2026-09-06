import type { UserSummaryDTO } from './user';
import type { AttachmentResponseDTO } from './attachment';

export interface CommentMentionRequest {
  userId: number;
  startIndex: number;
  length: number;
}

export interface CommentMentionResponse {
  user: UserSummaryDTO;
  startIndex: number;
  length: number;
}

export interface CommentRequestDTO {
  content: string;
  mentionUserIds: number[];
  attachmentIds: number[];
}

export interface CommentResponseDTO {
  id: number;
  content: string;
  author: UserSummaryDTO;
  createdAt: string;
  updatedAt: string;
  attachments: AttachmentResponseDTO[];
  mentions: CommentMentionResponse[];
}

export interface ParsedMention {
  userId: number;
  startIndex: number;
  length: number;
}