import { useRef, useState } from 'react';
import { MentionsInput, Mention, SuggestionDataItem } from 'react-mentions';
import { useAuthStore } from '../../store/use-auth-store';
import { useComment } from '../../hooks/use-comment';
import { getUserInitials } from '../common/user-card';
import { getInitials } from '../../utils/user.util';
import AttachmentService from '../../services/attachment.service';
import userService from '../../services/user.service';
import type { AttachmentResponseDTO } from '../../types/attachment';
import type { UserMentionDTO } from '../../types/user';
import CommentBubble from './comment-bubble';
import type { ParsedMention } from '../../types/comment';
import { parseMentions } from '../../utils/comment.util';
import React from 'react';

const mentionStyle = {
  control: {
    backgroundColor: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
  },

  '&multiLine': {
    control: {
      backgroundColor: '#fff',
      fontSize: '14px',
      fontWeight: '600',
      fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
      minHeight: '60px',
      maxHeight: '160px',
    },

    highlighter: {
      padding: '10px 12px',
      overflow: 'hidden',
      minHeight: '60px',
      maxHeight: '160px',
      lineHeight: '1.4',
      fontSize: '14px',
      fontWeight: '600',
      fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
    },

    input: {
      padding: '10px 12px',
      outline: 'none',
      border: 'none',
      overflow: 'auto',
      minHeight: '60px',
      maxHeight: '160px',
      lineHeight: '1.4',
      fontSize: '14px',
      fontWeight: '600',
      fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
    },
  },

  suggestions: {
    list: {
      backgroundColor: 'white',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
      fontSize: 13,
      maxHeight: 200,
      zIndex: 9999,
      position: 'absolute' as const,
      overflow: 'hidden',
      minWidth: '200px',
    },
    item: {
      padding: '6px 10px',
      borderBottom: '1px solid #f1f5f9',
      '&focused': {
        backgroundColor: '#e0e7ff',
        color: '#4338ca',
      },
    },
  },
};

interface CommentSectionProps {
  taskId: string;
  projectId?: number | string;
  onCommentCountChange?: (count: number) => void;
}

export function CommentSection({ taskId, projectId, onCommentCountChange }: CommentSectionProps) {
  const { user } = useAuthStore();
  const { comments, isLoading, error, addComment, deleteComment } = useComment(Number(taskId));

  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentResponseDTO[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const initials = user ? getUserInitials(user) : '?';
  const prevCountRef = useRef<number | null>(null);

  React.useEffect(() => {
    if (!isLoading && prevCountRef.current !== comments.length) {
      onCommentCountChange?.(comments.length);
      prevCountRef.current = comments.length;
    }
  }, [comments.length, onCommentCountChange]);

  const fetchMentionSuggestions = (
    query: string,
    callback: (data: SuggestionDataItem[]) => void
  ) => {
    const pId = projectId ? Number(projectId) : undefined;
    userService.searchMentionUsers(pId, query)
      .then((res) => {
        const users: UserMentionDTO[] = Array.isArray(res?.data) ? res.data : [];
        console.log(users);
        const formattedData: SuggestionDataItem[] = users.map((u: UserMentionDTO) => ({
          id: u.id.toString(),
          display: u.fullName,
          email: u.email,
          username: u.username,
          avatarUrl: u.avatarUrl,
        }));
        callback(formattedData);
      })
      .catch((err) => {
        console.error('Mention search error:', err);
        callback([]);
      });
  };

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return;

    const formData = new FormData();
    Array.from(e.target.files).forEach((file) => formData.append('files', file));

    setUploading(true);
    AttachmentService.uploadAttachments(formData)
      .then((res) => setAttachments((prev) => [...prev, ...res.data]))
      .catch((err) => alert('File upload error: ' + (err.response?.data?.message || err.message)))
      .finally(() => {
        setUploading(false);
        e.target.value = '';
      });
  }

  async function handleRemoveAttachment(idToRemove: number) {
    setAttachments((prev) => prev.filter((item) => item.id !== idToRemove));
    try {
      await AttachmentService.deleteAttachment(idToRemove);
    } catch (err) {
      // Ignore
    }
  }

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();

    if (
      (!text.trim() && attachments.length === 0) ||
      submitting ||
      uploading
    ) {
      return;
    }

    setSubmitting(true);

    try {
      const attachmentIds = attachments.map((a) => a.id);

      const parsed = parseMentions(text.trim());

      // Extract user IDs from mentions
      const mentionUserIds = parsed.mentions.map((m) => m.userId);

      await addComment({
        content: parsed.content,
        mentionUserIds,
        attachmentIds,
      });

      setText('');
      setAttachments([]);
    } catch (err: any) {
      console.error('Failed to submit comment:', err);
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <p className="m-0 text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider">Comments</p>
        {comments.length > 0 && (
          <span className="bg-slate-100 text-slate-500 text-[0.65rem] font-bold px-1.5 py-0.5 rounded-full">
            {comments.length}
          </span>
        )}
      </div>

      {isLoading && <p className="text-xs text-slate-400 text-center py-4">Loading comments...</p>}
      {!isLoading && error && <p className="text-xs text-red-500 text-center py-2">{error}</p>}

      {!isLoading && !error && (
        comments.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No comments yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {comments.map((c) => (
              <CommentBubble
                key={c.id}
                comment={c}
                currentUserId={user?.id}
                onDelete={() => deleteComment(c.id)}
              />
            ))}
          </div>
        )
      )}

      {/* Comment Form with react-mentions */}
      <form onSubmit={handleSubmit} className="flex gap-3 items-start">
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-1 overflow-hidden">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <div className="relative">
            <div className="border border-slate-200 rounded-xl bg-white focus-within:border-indigo-400 transition-colors">
              <MentionsInput
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a comment... (Type @ to mention)"
                style={mentionStyle}
              >
                <Mention
                  trigger="@"
                  data={fetchMentionSuggestions}
                  markup="@[__display__](user:__id__)"
                  displayTransform={(_id, display) => display}
                  className="bg-indigo-50"
                  renderSuggestion={(suggestion, _search, highlightedDisplay) => {
                    const u = suggestion as any;
                    return (
                      <div className="flex items-center gap-2.5 py-1">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 overflow-hidden">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            getInitials(u.display, u.email)
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-slate-800 truncate">{highlightedDisplay}</span>
                          <span className="text-[0.65rem] text-slate-400 truncate">{u.email || `@${u.username}`}</span>
                        </div>
                      </div>
                    );
                  }}
                />
              </MentionsInput>

              {/* Temporary File Attachments List */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-3 py-2 bg-slate-50 border-t border-slate-100">
                  {attachments.map((file) => (
                    <div key={file.id} className="flex items-center gap-1.5 text-[0.7rem] text-slate-700 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                      <span className="truncate max-w-[140px]">📎 {file.fileName}</span>
                      <button type="button" onClick={() => handleRemoveAttachment(file.id)} className="text-slate-400 hover:text-red-500 font-bold ml-1 cursor-pointer">✕</button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" />
                  <button type="button" disabled={uploading} onClick={() => fileInputRef.current?.click()} className="p-1 rounded-md text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 transition-colors disabled:opacity-50 cursor-pointer">
                    {uploading ? <span className="text-[0.65rem] text-indigo-600 font-medium animate-pulse">Uploading...</span> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>}
                  </button>
                  <span className="text-[0.65rem] text-slate-400">Ctrl+Enter to send</span>
                </div>

                <button type="submit" disabled={(!text.trim() && attachments.length === 0) || submitting || uploading} className="bg-indigo-600 hover:opacity-90 disabled:opacity-40 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-opacity cursor-pointer">
                  {submitting ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}