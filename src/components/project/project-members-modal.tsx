import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, X, RefreshCw, Trash2, Shield, Search, User } from 'lucide-react';
import ProjectMemberService, { ProjectMemberResponseDTO } from '../../services/project-member.service';
import { ProjectRole } from '../../services/invite.service';
import { getInitials } from '../../utils/user.util';

interface ProjectMembersModalProps {
  projectId: number;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onMembersUpdated?: () => void;
}

export default function ProjectMembersModal({
  projectId,
  projectTitle,
  isOpen,
  onClose,
  onMembersUpdated,
}: ProjectMembersModalProps) {
  const [members, setMembers] = useState<ProjectMemberResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [removingUserId, setRemovingUserId] = useState<number | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await ProjectMemberService.getAllMembers(projectId);
      setMembers(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch project members:', err);
      setError(err?.response?.data?.message || 'Failed to load project members');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchMembers();
    }
  }, [isOpen, projectId, fetchMembers]);

  const handleUpdateRole = async (userId: number, newRole: ProjectRole) => {
    setUpdatingUserId(userId);
    try {
      await ProjectMemberService.updateMemberRole(projectId, userId, newRole);
      setMembers((prev) =>
        prev.map((m) => (m.userId === userId ? { ...m, role: newRole } : m))
      );
      onMembersUpdated?.();
    } catch (err: any) {
      console.error('Failed to update member role:', err);
      alert(err?.response?.data?.message || 'Failed to update member role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRemoveMember = async (userId: number, fullName: string) => {
    if (!window.confirm(`Are you sure you want to remove member "${fullName}" from project?`)) {
      return;
    }
    setRemovingUserId(userId);
    try {
      await ProjectMemberService.removeMember(projectId, userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
      onMembersUpdated?.();
    } catch (err: any) {
      console.error('Failed to remove member:', err);
      alert(err?.response?.data?.message || 'Failed to remove member');
    } finally {
      setRemovingUserId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    try {
      return new Date(dateString).toLocaleDateString('en-US');
    } catch {
      return dateString;
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      m.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeClass = (role: ProjectRole) => {
    switch (role) {
      case ProjectRole.OWNER:
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case ProjectRole.ADMIN:
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case ProjectRole.MEMBER:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case ProjectRole.VIEWER:
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border border-slate-200/80 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/80 shrink-0 bg-slate-50/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 m-0">Project Members</h2>
                <p className="text-xs text-slate-500 m-0">
                  Project: <span className="font-semibold text-slate-700">{projectTitle}</span> ({members.length} members)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchMembers}
                disabled={isLoading}
                title="Refresh"
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {isLoading && members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
              <p className="text-xs font-medium">Loading project members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <User className="w-8 h-8 text-slate-300" />
              <p className="text-xs font-medium">No members found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredMembers.map((member) => (
                <div
                  key={member.id || member.userId}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                >
                  {/* User info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.fullName}
                        className="w-9 h-9 rounded-full object-cover shrink-0 shadow-xs border border-slate-200"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {getInitials(member.fullName, member.email)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {member.fullName}
                        </span>
                        <span
                          className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeClass(
                            member.role
                          )}`}
                        >
                          {member.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate m-0">{member.email}</p>
                    </div>
                  </div>

                  {/* Joined Date & Role Select / Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[0.7rem] text-slate-400 hidden sm:inline-block">
                      Joined: {formatDate(member.joinedAt)}
                    </span>

                    {/* Role Select */}
                    {member.role !== ProjectRole.OWNER ? (
                      <select
                        value={member.role}
                        disabled={updatingUserId === member.userId}
                        onChange={(e) =>
                          handleUpdateRole(member.userId, e.target.value as ProjectRole)
                        }
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer"
                      >
                        <option value={ProjectRole.ADMIN}>ADMIN</option>
                        <option value={ProjectRole.MEMBER}>MEMBER</option>
                        <option value={ProjectRole.VIEWER}>VIEWER</option>
                      </select>
                    ) : (
                      <span className="text-xs font-semibold text-purple-600 flex items-center gap-1 px-2 py-1 bg-purple-50 rounded-lg border border-purple-200">
                        <Shield className="w-3 h-3" /> Owner
                      </span>
                    )}

                    {/* Remove Member Button */}
                    {member.role !== ProjectRole.OWNER && (
                      <button
                        onClick={() => handleRemoveMember(member.userId, member.fullName)}
                        disabled={removingUserId === member.userId}
                        title="Remove member"
                        className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
