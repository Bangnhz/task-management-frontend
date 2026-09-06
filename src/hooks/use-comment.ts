import { useEffect, useState } from 'react';
import CommentService from '../services/comment.service';
import type { CommentRequestDTO, CommentResponseDTO } from '../types/comment';

interface UseCommentResult {
  comments: CommentResponseDTO[];
  isLoading: boolean;
  error: string | null;
  addComment: (body: CommentRequestDTO) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  refetch: () => void;
}

export function useComment(taskId: number): UseCommentResult {
  const [comments, setComments]   = useState<CommentResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [tick, setTick]           = useState(0);

  // ── Fetch comments ──
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !taskId) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    CommentService.getCommentsByTask(taskId)
      .then((res) => { if (!cancelled) setComments(res.data); })
      .catch((err: any) => {
        if (!cancelled && err?.response?.status !== 401) {
          setError(err?.response?.data?.message ?? err?.message ?? 'Không thể tải comments.');
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [taskId, tick]);

  async function addComment(body: CommentRequestDTO): Promise<void> {

    const res = await CommentService.createComment(taskId, body);
    setComments((prev) => [...prev, res.data]);
  }

  async function deleteComment(commentId: number): Promise<void> {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    // TODO: gọi API + rollback nếu lỗi
    // await CommentService.deleteComment(commentId);
  }

  return {
    comments,
    isLoading,
    error,
    addComment,
    deleteComment,
    refetch: () => setTick((t) => t + 1),
  };
}
