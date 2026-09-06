import { UserSummaryDTO } from "./user";

export interface AttachmentResponseDTO {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: UserSummaryDTO;
  createdAt: string;
}