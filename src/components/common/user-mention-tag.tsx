import { useState } from 'react';
import * as HoverCard from '@radix-ui/react-hover-card';
import type { UserMentionDTO } from '../../types/user';

// Cache lưu thông tin User Profile đã từng fetch
const userProfileCache = new Map<string, UserMentionDTO>();

import { getInitials } from '../../utils/user.util';

interface UserMentionTagProps {
  userId: string;
  displayName: string;
}

export function UserMentionTag({ userId, displayName }: UserMentionTagProps) {
  const [userInfo, setUserInfo] = useState<UserMentionDTO | null>(
    userProfileCache.get(userId) || null
  );
  const [loading, setLoading] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (open && !userInfo && !userProfileCache.has(userId)) {
      setLoading(true);
      fetch(`/api/users/${userId}/profile`)
        .then((res) => res.json())
        .then((data: UserMentionDTO) => {
          userProfileCache.set(userId, data);
          setUserInfo(data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  };

  return (
    <HoverCard.Root openDelay={200} closeDelay={150} onOpenChange={handleOpenChange}>
      <HoverCard.Trigger asChild>
        <span className="text-indigo-600 font-semibold bg-indigo-50 hover:bg-indigo-100 px-1 py-0.5 rounded cursor-pointer transition-colors inline-block">
          @{displayName}
        </span>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          className="w-64 rounded-xl bg-white p-4 shadow-xl border border-slate-100 z-50 animate-in fade-in-0 zoom-in-95"
          sideOffset={5}
        >
          {loading ? (
            <div className="text-xs text-slate-400 py-2 text-center">Loading details...</div>
          ) : userInfo ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center overflow-hidden shrink-0">
                  {userInfo.avatarUrl ? (
                    <img src={userInfo.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(userInfo.fullName, userInfo.email)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900 truncate m-0">{userInfo.fullName}</h4>
                  <p className="text-xs text-slate-500 truncate m-0">@{userInfo.username}</p>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2 flex flex-col gap-1 text-xs text-slate-600">
                <div>✉️ {userInfo.email}</div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-red-400">Failed to load info</div>
          )}
          <HoverCard.Arrow className="fill-white" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}