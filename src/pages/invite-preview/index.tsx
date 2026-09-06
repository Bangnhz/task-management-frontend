import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InviteService, { InvitePreviewResponse, MemberStatus, ProjectRole } from '../../services/invite.service';
import { ClipboardList } from 'lucide-react';

export default function InvitePreviewPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [preview, setPreview] = useState<InvitePreviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionResult, setActionResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (token) {
      fetchPreview(token);
    }
  }, [token]);

  const fetchPreview = async (inviteToken: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await InviteService.getPreview(inviteToken);
      if (response.data.memberStatus === MemberStatus.ACTIVE) {
        navigate(`/projects/${response.data.projectId}`, { replace: true });
        return;
      }
      setPreview(response.data);
    } catch (err: any) {
      console.error('Failed to fetch invitation preview:', err);
      setError(err?.response?.data?.message || 'Invalid or expired invitation link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!token) return;
    
    setIsProcessing(true);
    setActionResult(null);
    
    try {
      const response = await InviteService.acceptInvitation(token);
      const member = response.data;
      if (member.status === MemberStatus.PENDING) {
        setActionResult({
          success: true,
          message: 'Join request sent. Please wait for admin approval!',
        });
        // Không chuyển vào project ngay, chỉ cập nhật state preview
        setPreview(prev => prev ? { ...prev, memberStatus: MemberStatus.PENDING } : null);
      } else {
        setActionResult({
          success: true,
          message: 'Successfully joined the project!',
        });
        setTimeout(() => {
          navigate(`/projects/${member.projectId}`);
        }, 1500);
      }
    } catch (err: any) {
      console.error('Failed to accept invitation:', err);
      setActionResult({
        success: false,
        message: err?.response?.data?.message || 'Failed to join the project'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!token) return;
    
    setIsProcessing(true);
    setActionResult(null);
    
    try {
      await InviteService.cancelJoinRequest(token);
      setActionResult({
        success: true,
        message: 'Invitation declined successfully'
      });
      
      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate('/projects');
      }, 2000);
    } catch (err: any) {
      console.error('Failed to cancel invitation:', err);
      setActionResult({
        success: false,
        message: err?.response?.data?.message || 'Failed to decline invitation'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleDisplay = (role: ProjectRole) => {
    switch (role) {
      case ProjectRole.OWNER: return 'Owner';
      case ProjectRole.ADMIN: return 'Admin';
      case ProjectRole.MEMBER: return 'Member';
      case ProjectRole.VIEWER: return 'Viewer';
      default: return role;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-sm text-slate-600">Loading invitation details...</p>
        </div>
      </div>
    );
  }

  if (error || !preview) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-red-600">⚠</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mb-2">Invalid Invitation</h1>
            <p className="text-sm text-slate-600 mb-6">
              {error || 'This invitation link is invalid or has expired.'}
            </p>
            <button
              onClick={() => navigate('/projects')}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Go to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <ClipboardList className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Project Invitation</h1>
        <p className="text-sm text-slate-600">You've been invited to join a project</p>
      </div>

      {/* Thông tin dự án */}
      <div className="bg-slate-50 rounded-lg p-4 space-y-2 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Project</span>
          <span className="text-sm font-semibold text-slate-900">{preview.projectTitle}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Role</span>
          <span className="text-sm font-semibold text-indigo-600">
            {getRoleDisplay(preview.assignedRole)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Approval Required</span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              preview.requiresApproval
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-green-100 text-green-800'
            }`}
          >
            {preview.requiresApproval ? 'Yes' : 'No'}
          </span>
        </div>
      </div>

      {/* Khu vực nút bấm */}
      <div className="space-y-3">
        {preview.memberStatus === MemberStatus.ACTIVE ? (
          <button
            onClick={() => navigate(`/projects/${preview.projectId}`)}
            className="w-full px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Project
          </button>
        ) : preview.memberStatus === MemberStatus.PENDING ? (
          <>
            <button
              disabled
              className="w-full px-4 py-3 bg-amber-100 text-amber-800 font-medium rounded-lg cursor-not-allowed text-center"
            >
              ⏳ Pending approval
            </button>
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
            >
              Decline
            </button>
            
          </>
        ) : (
          <>
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Accept Invitation'}
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="w-full px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Back to Projects
            </button>
          </>
        )}
      </div>
    </div>
  </div>
);
}