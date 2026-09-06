import { AttachmentResponseDTO } from "../types/attachment";
import api from "./api";

const AttachmentService = {
    uploadAttachments: (formData: FormData) =>
        api.post<AttachmentResponseDTO[]>(`/attachments`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }),
    deleteAttachment: (id: number) =>
        api.delete(`/attachments/${id}`),
}
export default AttachmentService;
