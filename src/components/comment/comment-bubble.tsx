import React from 'react';
import type { CommentResponseDTO } from '../../types/comment';
import { formatDateTime } from '../../utils/format-date';
import { getInitials } from '../../utils/user.util';
import MentionUser from './mention-user';

interface CommentBubbleProps {
  comment: CommentResponseDTO;
  currentUserId?: number;
  onDelete: () => void;
}

export default function CommentBubble({ comment, currentUserId, onDelete }: CommentBubbleProps) {
  const authorInitials = getInitials(comment.author.fullName);

  const isOwn = comment.author.id === currentUserId;
  const time  = formatDateTime(comment.createdAt);
  function renderCommentContent(comment: CommentResponseDTO){
    const content = comment.content;
    const mentions = [...(comment.mentions ?? [])]
      .sort((a, b) => a.startIndex - b.startIndex);
    if (mentions.length === 0) {
      return content;
    }
    const elements: React.ReactNode[] = [];
    let currentIndex = -1;
    mentions.forEach((mention,index) => {
      const start = mention.startIndex;
      const end = start + mention.length;
      if(start > currentIndex){
        elements.push(
        <React.Fragment key={`text-${index}`}>
          {content.slice(currentIndex, start)}
        </React.Fragment>
      );
      elements.push(
      <MentionUser
        key={`mention-${index}`}
        mention={mention}
      />)
      currentIndex = end
      }
    });
    if (currentIndex < content.length) {
    elements.push(
      <React.Fragment key="text-end">
        {content.slice(currentIndex)}
      </React.Fragment>
    );
  }
  return elements;
  }
  return (
    <div className="flex gap-3 group">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
        {comment.author.avatarUrl
          ? <img src={comment.author.avatarUrl} alt={comment.author.fullName} className="w-full h-full object-cover" />
          : authorInitials
        }
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-900">{comment.author.fullName}</span>
          <span className="text-[0.68rem] text-slate-400">{time}</span>
        </div>

        <div className="relative bg-slate-50 border border-slate-200/70 rounded-xl rounded-tl-sm px-3 py-2.5">
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {renderCommentContent(comment)}
          </p>

          {/* Attachments */}
          {comment.attachments?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {comment.attachments.map((a) => (
                <a
                  key={a.id}
                  href={a.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-[0.7rem] text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-2 py-1 hover:bg-indigo-100 transition-colors no-underline"
                >
                  📎 {a.fileName}
                </a>
              ))}
            </div>
          )}

          {/* Delete — chỉ hiện với comment của chính mình */}
          {isOwn && (
            <button
              onClick={onDelete}
              aria-label="Delete comment"
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-400 text-[0.6rem] items-center justify-center hidden group-hover:flex hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
