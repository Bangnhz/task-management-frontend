import type { UserResponseDTO } from '../../types/auth';
import { getInitials } from '../../utils/user.util';

interface UserCardProps {
  user: UserResponseDTO;
  className?: string;
}

export function getUserInitials(user: UserResponseDTO): string {
  return getInitials(user.fullName, user.email);
}


export default function UserCard({ user, className = '' }: UserCardProps) {
  const initials = getUserInitials(user);

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden">
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>

      {/* Info */}
      <div className="overflow-hidden flex-1">
        <p className="m-0 font-bold text-sm text-slate-900 truncate">
          {user.fullName || user.email}
        </p>
        <p className="m-0 text-xs text-slate-500 truncate">
          {user.email}
        </p>
      </div>
    </div>
  );
}
