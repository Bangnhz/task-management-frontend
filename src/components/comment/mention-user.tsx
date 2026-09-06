import { useState } from 'react';
import { CommentMentionResponse } from "@/types/comment";
import UserCard from "../common/user-card";
import { UserResponseDTO } from "@/types/auth";

interface MentionUserProps {
  mention: CommentMentionResponse;
}

export default function MentionUser({ mention }: MentionUserProps) {
  const [isOpen, setIsOpen] = useState(false);
  const user = mention.user;

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">
        @{user.fullName}
      </span>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 z-50 w-64 rounded-xl border border-slate-200 bg-white shadow-xl p-3"
        >
          <UserCard user={user as UserResponseDTO} />
        </div>
      )}
    </span>
  );
}