import React from 'react';
import { History, MessageSquare, FileText, X, User } from 'lucide-react';
import { useUIStore } from '../../store/use-ui-store';
import PriorityBadge from '../common/priority-badge';
import type { Task } from '../../types/task';
import { CommentSection } from '../comment/comment-section';
import ActivityTimeline from '../activity/ActivityTimeline';
import ProjectMemberService, { type ProjectMemberResponseDTO } from '../../services/project-member.service';
import TaskService from '../../services/task.service';
import { useParams } from 'react-router-dom';

// ── Props ──────────────────────────────────────────────────────
interface TaskDetailDrawerProps {
  /** Task passed from outside */
  taskOverride?: Task | null;
  /** Default open tab */
  initialTab?: 'details' | 'comments' | 'activities';
  /** Callback on drawer close */
  onClose?: () => void;
  /** Callback when comment count changes */
  onCommentCountChange?: (taskId: string, count: number) => void;
  /** Callback when task is updated */
  onTaskUpdated?: () => void;
}

// ── Component ──────────────────────────────────────────────────
export default function TaskDetailDrawer({
  taskOverride,
  initialTab,
  onClose,
  onCommentCountChange,
  onTaskUpdated,
}: TaskDetailDrawerProps = {}) {
  const { isTaskDrawerOpen, closeTaskDrawer, taskDrawerTab } = useUIStore();
  const { id } = useParams<{ id: string }>();
  const handleClose = onClose ?? closeTaskDrawer;
  const isOpen = onClose ? true : isTaskDrawerOpen;
  const task = taskOverride ?? null;

  const [activeTab, setActiveTab] = React.useState<'details' | 'comments' | 'activities'>(
    initialTab || taskDrawerTab || 'details'
  );

  const [members, setMembers] = React.useState<ProjectMemberResponseDTO[]>([]);
  const [isAssigning, setIsAssigning] = React.useState(false);
  const [currentAssigneeId, setCurrentAssigneeId] = React.useState<string | number | null>(task?.assignee?.id || null);

  React.useEffect(() => {
    setActiveTab(initialTab || taskDrawerTab || 'details');
  }, [initialTab, taskDrawerTab, task?.id]);

  React.useEffect(() => {
    if (id) {
      ProjectMemberService.getAllMembers(Number(id))
        .then((res) => {
          setMembers(res.data);
        })
        .catch((err) => {
          console.error('Failed to fetch project members:', err);
        });
    }
    setCurrentAssigneeId(task?.assignee?.id || null);
  }, [task?.projectId, task?.id, task?.assignee?.id, id]);

  const handleCommentCountChange = React.useCallback(
    (count: number) => {
      if (!task) return;
      onCommentCountChange?.(task.id, count);
    },
    [task, onCommentCountChange],
  );

  async function handleAssigneeChange(val: string) {
    if (!task) return;
    const newAssigneeId = val ? Number(val) : undefined;
    setIsAssigning(true);
    try {
      await TaskService.update({
        id: task.id,
        assigneeId: newAssigneeId,
      });
      setCurrentAssigneeId(val ? Number(val) : null);
      onTaskUpdated?.();
    } catch (error: any) {
      console.error('Failed to assign user:', error);
      alert(error?.response?.data?.message || 'Failed to assign user');
    } finally {
      setIsAssigning(false);
    }
  }

  if (!isOpen) return null;

  const commentCount = task?.commentCount || 0;
  const assignedMember = members.find((m) => m.userId.toString() === currentAssigneeId?.toString());

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        aria-hidden="true"
        className="fixed inset-0 bg-slate-900/30 z-40 transition-opacity"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Task detail"
        className="fixed top-0 right-0 bottom-0 w-full max-w-[540px] bg-white border-l border-slate-200/60 shadow-[-8px_0_32px_rgba(15,23,42,.12)] z-[41] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/60 shrink-0">
          <h2 className="text-sm font-bold text-slate-900 m-0">Task Details</h2>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {task ? (
          <>
            {/* Tab Navigation */}
            <div className="px-5 pt-4 pb-2 border-b border-slate-100 shrink-0 bg-slate-50/50">
              <div className="flex gap-1 bg-slate-200/60 p-1 rounded-xl">
                {/* Tab Details */}
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'details'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>

                {/* Tab Comments */}
                <button
                  type="button"
                  onClick={() => setActiveTab('comments')}
                  className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'comments'
                      ? 'bg-white text-indigo-600 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Comments</span>
                  {commentCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-600">
                      {commentCount}
                    </span>
                  )}
                </button>

                {/* Tab Activities */}
                <button
                  type="button"
                  onClick={() => setActiveTab('activities')}
                  className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'activities'
                      ? 'bg-white text-amber-600 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Activity</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
              {/* Task Title */}
              <h1 className="text-base font-bold text-slate-900 m-0 leading-snug">{task.title}</h1>

              {activeTab === 'details' && (
                <>
                  {/* Assignee Field */}
                  <div className="flex flex-col gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[0.7rem] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-500" />
                        Assignee
                      </label>
                      {isAssigning && <span className="text-[0.65rem] text-indigo-600 font-semibold animate-pulse">Updating...</span>}
                    </div>
                    <select
                      value={currentAssigneeId ?? ''}
                      onChange={(e) => handleAssigneeChange(e.target.value)}
                      disabled={isAssigning}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all cursor-pointer shadow-2xs"
                    >
                      <option value="">— Unassigned —</option>
                      {members.map((member) => (
                        <option key={member.userId} value={member.userId}>
                          {member.fullName} ({member.email})
                        </option>
                      ))}
                    </select>
                    {assignedMember && (
                      <p className="text-[0.7rem] text-emerald-600 font-semibold m-0 mt-0.5 flex items-center gap-1">
                        ✓ Assigned to: {assignedMember.fullName} ({assignedMember.role})
                      </p>
                    )}
                  </div>

                  {/* Meta grid */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <TaskField label="Project" value={task.projectName} />
                    <TaskField label="Status" value={task.status} />
                    <TaskField label="Start Date" value={task.startDate ? task.startDate.slice(0, 10) : '—'} />
                    <TaskField label="Due Date" value={task.dueDate?.slice(0, 10) ?? '—'} />
                  </div>

                  {/* Priority */}
                  <div>
                    <p className="m-0 mb-2 text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider">Priority</p>
                    <PriorityBadge priority={task.priority} />
                  </div>

                  {/* Description */}
                  {task.description && (
                    <div>
                      <p className="m-0 mb-2 text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider">Description</p>
                      <p className="m-0 text-sm text-slate-700 leading-relaxed">{task.description}</p>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'comments' && (
                <>
                  <div className="border-t border-slate-100 pt-2" />
                  <CommentSection taskId={task.id} projectId={task.projectId} onCommentCountChange={handleCommentCountChange} />
                </>
              )}

              {activeTab === 'activities' && (
                <>
                  <div className="border-t border-slate-100 pt-2" />
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Task Activity Log
                    </h3>
                    <ActivityTimeline entityType="TASK" entityId={task.id} />
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-slate-400 text-sm">Select a task to view details.</p>
          </div>
        )}
      </aside>
    </>
  );
}

// ── TaskField helper ───────────────────────────────────────────
function TaskField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="m-0 mb-1 text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="m-0 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
