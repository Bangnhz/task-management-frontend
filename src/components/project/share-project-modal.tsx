import React, { useState, useEffect, useCallback } from 'react';
import InviteService, { ProjectRole, ProjectInvitationCreateRequest } from '../../services/invite.service';

interface ShareProjectModalProps {
  projectId: number;
  projectTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onInvitationCreated?: (invitation: { id: number; token: string; expiresAt: string; link: string }) => void;
}

export default function ShareProjectModal({
  projectId,
  projectTitle,
  isOpen,
  onClose,
  onInvitationCreated,
}: ShareProjectModalProps) {
  const [role, setRole] = useState<ProjectRole>(ProjectRole.MEMBER);
  const [expireDays, setExpireDays] = useState<number>(7);
  const [requiresApproval, setRequiresApproval] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingActive, setIsLoadingActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdInvitation, setCreatedInvitation] = useState<{ 
    id: number; 
    token: string; 
    expiresAt: string;
    link: string;
    role: ProjectRole;
    requiresApproval: boolean;
  } | null>(null);

  const fetchActiveInvitation = useCallback(async () => {
    setIsLoadingActive(true);
    setError(null);
    
    try {
      const response = await InviteService.getActiveInvitationByUser(projectId);
      if (response?.data) {
        const invitationData = response.data;
        setCreatedInvitation({
          id: invitationData.id,
          token: invitationData.token,
          expiresAt: invitationData.expiresAt,
          link: InviteService.getInvitationLink(invitationData.token),
          role: invitationData.role,
          requiresApproval: invitationData.requiresApproval,
        });
      } else {
        setCreatedInvitation(null);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No active invitation exists, that's fine
        setCreatedInvitation(null);
      } else {
        console.error('Failed to fetch active invitation:', err);
        setError(err?.response?.data?.message || 'Failed to load active invitation');
      }
    } finally {
      setIsLoadingActive(false);
    }
  }, [projectId]);

  // Load active invitation when modal opens
  useEffect(() => {
    if (isOpen && projectId) {
      fetchActiveInvitation();
    }
  }, [isOpen, projectId, fetchActiveInvitation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: ProjectInvitationCreateRequest = {
        role,
        expireDays,
        requiresApproval,
      };

      const response = await InviteService.createInvitation(projectId, payload);
      const invitationData = response.data;
       
      const invitation = {
        id: invitationData.id,
        token: invitationData.token,
        expiresAt: invitationData.expiresAt,
        link: InviteService.getInvitationLink(invitationData.token),
        role: invitationData.role,
        requiresApproval: invitationData.requiresApproval,
      };
      
      setCreatedInvitation(invitation);
      onInvitationCreated?.(invitation);
    } catch (err: any) {
      console.error('Failed to create invitation:', err);
      setError(err?.response?.data?.message || 'Failed to create invitation link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async () => {
    if (!createdInvitation) return;
    
    try {
      await navigator.clipboard.writeText(createdInvitation.link);
      alert('Invitation link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy link to clipboard');
    }
  };

  const handleResetLink = () => {
    setCreatedInvitation(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Share Project</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 transition-colors text-lg leading-none"
            >
              ✕
            </button>
          </div>

          <p className="text-sm text-slate-600 mb-6">
            Share <span className="font-semibold">{projectTitle}</span> with others
          </p>

          {isLoadingActive ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-3 text-sm text-slate-600">Loading existing invitation...</p>
            </div>
          ) : createdInvitation ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600">✓</span>
                  <h3 className="text-sm font-semibold text-green-800">Active invitation exists!</h3>
                </div>
                <div className="text-xs text-green-700 space-y-1 mb-3">
                  <p>Role: <span className="font-semibold">{createdInvitation.role}</span></p>
                  <p>Expires: <span className="font-semibold">{new Date(createdInvitation.expiresAt).toLocaleDateString()}</span></p>
                  <p>Requires approval: <span className="font-semibold">{createdInvitation.requiresApproval ? 'Yes' : 'No'}</span></p>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdInvitation.link}
                    className="flex-1 text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 truncate"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 whitespace-nowrap"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleResetLink}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Create New Link
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as ProjectRole)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={ProjectRole.VIEWER}>Viewer (Read-only)</option>
                  <option value={ProjectRole.MEMBER}>Member (Can edit tasks)</option>
                  <option value={ProjectRole.ADMIN}>Admin (Full access)</option>
                  <option value={ProjectRole.OWNER}>Owner (Full access + manage members)</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Defines what the invited user can do in the project
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Expires in (days)
                </label>
                <select
                  value={expireDays}
                  onChange={(e) => setExpireDays(Number(e.target.value))}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value={1}>1 day</option>
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                  <option value={365}>1 year</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiresApproval"
                  checked={requiresApproval}
                  onChange={(e) => setRequiresApproval(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="requiresApproval" className="text-sm text-slate-700">
                  Requires my approval before joining
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Create Invitation Link'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}