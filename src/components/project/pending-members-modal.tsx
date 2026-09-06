import React, { useState, useEffect, useCallback } from 'react';
import ProjectMemberService, { ProjectMemberResponseDTO, ProjectMemberStatusRequestDTO } from '../../services/project-member.service';
import { MemberStatus, ProjectRole } from '../../services/invite.service';
import { getInitials } from '../../utils/user.util';

interface PendingMembersModalProps {
  projectId: number;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onMemberStatusUpdated?: () => void;
}

export default function PendingMembersModal({
  projectId,
  projectTitle,
  isOpen,
  onClose,
  onMemberStatusUpdated,
}: PendingMembersModalProps) {
  const [pendingMembers, setPendingMembers] = useState<ProjectMemberResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<{ userId: number; status: MemberStatus.PENDING} | null>(null);
  const fetchPendingMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await ProjectMemberService.getPendingMembers(projectId);
      setPendingMembers(response.data);
    } catch (err: any) {
      console.error('Failed to fetch pending members:', err);
      setError(err?.response?.data?.message || 'Failed to load pending members');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen && projectId) {
      fetchPendingMembers();
    }
  }, [isOpen, projectId, fetchPendingMembers]);
  

  const handleChangeStatus = async (memberId: number, status: MemberStatus) => {
    const request: ProjectMemberStatusRequestDTO = {status};
    try {
      await ProjectMemberService.updateMemberStatus(projectId, memberId, request);
      setPendingMembers(prev => prev.filter(member => member.id !== memberId));
      onMemberStatusUpdated?.();
    } catch (err: any) {
      console.error('Failed to approve member:', err);
      alert(err?.response?.data?.message || 'Failed to approve member');
    } finally {
      setProcessingAction(null);
    }
  };


  const handleUpdateRole = async (userId: number, newRole: ProjectRole) => {
    // setProcessingAction({ userId, action: 'update-role' });
    
    // try {
    //   await ProjectMemberService.updateMemberRole(projectId, userId, newRole);
    //   // Update role in local state
    //   setPendingMembers(prev => prev.map(member => 
    //     member.userId === userId ? { ...member, role: newRole } : member
    //   ));
    //   onMemberStatusUpdated?.();
    // } catch (err: any) {
    //   console.error('Failed to update member role:', err);
    //   alert(err?.response?.data?.message || 'Failed to update member role');
    // } finally {
    //   setProcessingAction(null);
    // }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US');
    } catch {
      return dateString;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pending Members</h2>
              <p className="text-sm text-slate-600 mt-1">
                Users waiting to join: <span className="font-semibold">{projectTitle}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 transition-colors text-lg leading-none p-2"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-red-700">{error}</p>
              <button
                onClick={fetchPendingMembers}
                className="mt-2 px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-3 text-sm text-slate-600">Loading pending members...</p>
            </div>
          ) : pendingMembers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-slate-400">👤</span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">No pending members</h3>
              <p className="text-sm text-slate-600">
                All invitation requests have been processed.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingMembers.map((member) => (
                <div
                  key={`${member.projectId}-${member.userId}`}
                  className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.fullName}
                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 text-sm font-bold flex items-center justify-center shrink-0">
                            {getInitials(member.fullName, member.email)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 truncate">{member.fullName}</h4>
                          <p className="text-xs text-slate-500 truncate">{member.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400">Requested role:</span>
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.userId, e.target.value as ProjectRole)}
                            disabled={processingAction?.userId === member.userId }
                            className="ml-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
                          >
                            <option value={ProjectRole.VIEWER}>Viewer</option>
                            <option value={ProjectRole.MEMBER}>Member</option>
                            <option value={ProjectRole.ADMIN}>Admin</option>
                          </select>
                        </div>
                        <div>
                          <span className="text-slate-400">Joined:</span>
                          <span className="ml-2 font-medium text-slate-700">{formatDate(member.joinedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 items-center justify-center shrink-0">
                      <button
                        onClick={() => handleChangeStatus(member.id, MemberStatus.ACTIVE)}
                        disabled={processingAction?.userId === member.userId}
                        className="px-4 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                      >
                        {processingAction?.userId === member.userId? (
                          'Approving...'
                        ) : (
                          '✓ Approve'
                        )}
                      </button>
                      <button
                        onClick={() => handleChangeStatus(member.id, MemberStatus.REJECTED)}
                        disabled={processingAction?.userId === member.userId}
                        className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                      >
                        {processingAction?.userId === member.userId? (
                          'Rejecting...'
                        ) : (
                          '✗ Reject'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 shrink-0">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              <span className="font-medium text-slate-700">{pendingMembers.length}</span> pending request{pendingMembers.length !== 1 ? 's' : ''}
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchPendingMembers}
                disabled={isLoading}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}