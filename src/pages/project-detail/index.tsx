import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Users,
  Share2,
  LayoutGrid,
  List as ListIcon,
  Calendar as CalendarIcon,
  Clock,
  ClipboardList,
  AlertCircle,
  History,
  UserCheck,
} from 'lucide-react';
import BoardView from './components/board-view';
import ListView from './components/list-view';
import CalendarView from '../../components/common/calendar-view';
import TimelineView from './components/timeline-view';
import ColumnModal from './components/column-modal';
import TaskDetailDrawer from '../../components/task/task-detail-drawer';
import ShareProjectModal from '../../components/project/share-project-modal';
import PendingMembersModal from '../../components/project/pending-members-modal';
import ProjectMembersModal from '../../components/project/project-members-modal';
import ProjectActivityDrawer from '../../components/project/project-activity-drawer';
import TaskFilterBar, { AssigneeOption } from '../../components/task/task-filter-bar';
import TaskService from '../../services/task.service';
import ProjectMemberService from '../../services/project-member.service';
import { useAuthStore } from '../../store/use-auth-store';
import { Skeleton } from '../../components/common/loading-skeleton';
import { transformTask } from '../../utils/task.util';
import {
  TaskFilterState,
  DEFAULT_TASK_FILTER_STATE,
  filterTask,
} from '../../utils/filter-task.util';
import type { Task, TaskListDTO, TaskSummaryDTO } from '../../types/task';

type ViewType = 'board' | 'list' | 'calendar' | 'timeline';

const VIEWS: { key: ViewType; label: string; icon: React.ReactNode }[] = [
  { key: 'board', label: 'Board', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { key: 'list', label: 'List', icon: <ListIcon className="w-3.5 h-3.5" /> },
  { key: 'calendar', label: 'Calendar', icon: <CalendarIcon className="w-3.5 h-3.5" /> },
  { key: 'timeline', label: 'Timeline', icon: <Clock className="w-3.5 h-3.5" /> },
];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const viewParam = searchParams.get('view');
  const activeView: ViewType = (['board', 'list', 'calendar', 'timeline'] as const).includes(viewParam as ViewType)
    ? (viewParam as ViewType)
    : 'board';

  const handleViewChange = (view: ViewType) => {
    setSearchParams({ view });
  };
  const { user } = useAuthStore();
  const [taskLists, setTaskLists] = useState<TaskListDTO[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterState, setFilterState] = useState<TaskFilterState>(DEFAULT_TASK_FILTER_STATE);
  const [members, setMembers] = useState<AssigneeOption[]>([]);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [drawerTab, setDrawerTab] = useState<'details' | 'comments'>('details');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [pendingMembersModalOpen, setPendingMembersModalOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);
  const [isCreateColumnModalOpen, setIsCreateColumnModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    ProjectMemberService.getAllMembers(Number(id))
      .then((res) => {
        setMembers(
          (res.data || []).map((m) => ({
            id: m.userId,
            fullName: m.fullName,
            avatarUrl: m.avatarUrl,
          }))
        );
      })
      .catch((err) => {
        console.error('Failed to fetch project members:', err);
      });
  }, [id]);

  const fetchTaskLists = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await TaskService.getTaskListsByProject(Number(id));

      setTaskLists(response.data);
      const allTasks: Task[] = response.data.flatMap((taskList: TaskListDTO) =>
        taskList.tasks.map((taskSummary: TaskSummaryDTO) => {
          const mappedTask: Task = transformTask(
            {
              ...taskSummary,
              isDone: taskList.isDone,
            },
            taskList.title
          );
          mappedTask.projectId = id || '';
          return mappedTask;
        })
      );

      setTasks(allTasks);
    } catch (err: any) {
      console.error('❌ Lỗi tải TaskLists:', err);
      setError(err?.response?.data?.message || 'Không thể tải tasks');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTaskLists();
  }, [fetchTaskLists]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => filterTask(t, filterState));
  }, [tasks, filterState]);

  const filteredTaskLists = useMemo(() => {
    return taskLists.map((list) => {
      const filteredTasksInList = list.tasks.filter((taskSummary) => {
        const taskObj = transformTask(
          {
            ...taskSummary,
            isDone: list.isDone,
          },
          list.title
        );
        taskObj.projectId = id || '';
        return filterTask(taskObj, filterState);
      });
      return {
        ...list,
        tasks: filteredTasksInList,
      };
    });
  }, [taskLists, filterState, id]);

  function openTask(task: Task, tab: 'details' | 'comments' = 'details') {
    setSelectedTask(task);
    setDrawerTab(tab);
    setDrawerOpen(true);
  }

  function closeTask() {
    setDrawerOpen(false);
    setTimeout(() => setSelectedTask(null), 200);
  }

  async function handleTaskMove(taskId: string, targetListId: number, targetIndex?: number) {
    // 1. Tìm task đang kéo và cột nguồn
    let movingTask: TaskSummaryDTO | null = null;
    let sourceListId: number | null = null;

    for (const list of taskLists) {
      const found = list.tasks.find((t) => t.id.toString() === taskId);
      if (found) {
        movingTask = found;
        sourceListId = list.id;
        break;
      }
    }

    const targetList = taskLists.find((l) => l.id === targetListId);
    if (!movingTask || !targetList) return;

    // 2. Lấy danh sách task của cột đích
    const destTasks = targetList.tasks.filter((t) => t.id.toString() !== taskId);

    const insertIndex =
      targetIndex !== undefined && targetIndex >= 0
        ? Math.min(targetIndex, destTasks.length)
        : destTasks.length;

    // 3. Tính toán position số thực
    let newPosition: number;
    if (destTasks.length === 0) {
      newPosition = 65536.0;
    } else if (insertIndex === 0) {
      newPosition = (destTasks[0].position || 65536.0) / 2;
    } else if (insertIndex >= destTasks.length) {
      newPosition = (destTasks[destTasks.length - 1].position || 0) + 65536.0;
    } else {
      const prevPos = destTasks[insertIndex - 1].position || 0;
      const nextPos = destTasks[insertIndex].position || prevPos + 65536.0;
      newPosition = (prevPos + nextPos) / 2;
    }

    const updatedMovingTask: TaskSummaryDTO = {
      ...movingTask,
      position: newPosition,
      listTitle: targetList.title,
    };

    // 4. Lưu snapshot cũ để rollback
    const previousTaskLists = [...taskLists];

    // 5. Cập nhật state UI (Optimistic Update)
    setTaskLists((prevLists) =>
      prevLists.map((list) => {
        if (list.id === sourceListId && sourceListId === targetListId) {
          const newTasks = list.tasks.filter((t) => t.id.toString() !== taskId);
          newTasks.splice(insertIndex, 0, updatedMovingTask);
          return { ...list, tasks: newTasks };
        }

        if (list.id === sourceListId) {
          return {
            ...list,
            tasks: list.tasks.filter((t) => t.id.toString() !== taskId),
          };
        }

        if (list.id === targetListId) {
          const newTasks = [...list.tasks];
          newTasks.splice(insertIndex, 0, updatedMovingTask);
          return { ...list, tasks: newTasks };
        }

        return list;
      })
    );

    // 6. Gửi API lên Backend
    try {
      await TaskService.reorder(Number(taskId), {
        targetListId: targetListId,
        position: newPosition,
      });
    } catch (error: any) {
      console.error('❌ Lỗi khi di chuyển task:', error);
      setTaskLists(previousTaskLists);
      alert(error?.response?.data?.message || 'Không thể lưu vị trí mới của task');
    }
  }

  function handleCommentCountChange(taskId: string, count: number) {
    setTaskLists((prevLists) =>
      prevLists.map((list) => ({
        ...list,
        tasks: list.tasks.map((t) =>
          t.id.toString() === taskId.toString()
            ? { ...t, commentCount: count }
            : t
        ),
      }))
    );

    // B. Cập nhật tasks -> Cho ListView, CalendarView
    setTasks((prev) =>
      prev.map((t) =>
        t.id.toString() === taskId.toString()
          ? { ...t, commentCount: count }
          : t
      )
    );
  }


  // Project title from task data or fallback
  const projectTitle = tasks[0]?.projectName || taskLists[0]?.tasks[0]?.projectTitle || `Project #${id}`;

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 bg-white border-b border-slate-200/60 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="text-slate-400 hover:text-slate-700 transition-colors p-2 rounded-xl hover:bg-slate-100 active:scale-95"
            aria-label="Back to projects"
            title="Back to projects"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-600 shrink-0 shadow-2xs">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 m-0 truncate max-w-xs" title={projectTitle}>
              {projectTitle}
            </h1>
            <p className="text-xs text-slate-400 m-0 mt-0.5">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</p>
          </div>
        </div>

        <div className="flex gap-0.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => handleViewChange(v.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer
                ${activeView === v.key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}`}
            >
              {v.icon}
              <span>{v.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Activity Feed */}
          <button
            onClick={() => setActivityDrawerOpen(true)}
            className="group flex items-center gap-2 bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-all duration-200 border border-slate-200/70 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
            title="Activity Feed"
          >
            <History className="w-4 h-4 shrink-0 text-slate-500 group-hover:text-indigo-600 transition-colors" />
            <span>Activity Feed</span>
          </button>

          {/* Pending Members */}
          <button
            onClick={() => setPendingMembersModalOpen(true)}
            className="group flex items-center gap-2 bg-amber-50/90 hover:bg-amber-100 text-amber-800 font-semibold text-xs px-3.5 py-2 rounded-xl transition-all duration-200 border border-amber-200/80 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
            title="View pending member requests"
          >
            <Users className="w-4 h-4 shrink-0 text-amber-600 group-hover:scale-110 transition-transform" />
            <span>Pending Members</span>
          </button>

          {/* Members */}
          <button
            onClick={() => setMembersModalOpen(true)}
            className="group flex items-center gap-2 bg-indigo-50/90 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs px-3.5 py-2 rounded-xl transition-all duration-200 border border-indigo-200/80 shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
            title="View project members"
          >
            <UserCheck className="w-4 h-4 shrink-0 text-indigo-600 group-hover:scale-110 transition-transform" />
            <span>Members</span>
          </button>

          {/* Share */}
          <button
            onClick={() => setShareModalOpen(true)}
            className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-indigo-200 transition-all duration-200 active:scale-95 cursor-pointer"
            title="Share Project"
          >
            <Share2 className="w-4 h-4 shrink-0 group-hover:rotate-12 transition-transform" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {(() => {
          if (isLoading) {
            return (
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          if (error && !isLoading) {
            return (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-center p-8">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4 text-amber-500 shadow-sm">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Unable to load tasks</h3>
                  <p className="text-sm text-slate-600 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all active:scale-95"
                  >
                    Try again
                  </button>
                </div>
              </div>
            );
          }

          if (!isLoading && !error && taskLists.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-center p-8 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600 shadow-sm">
                    <ClipboardList className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No task lists yet</h3>
                  <p className="text-sm text-slate-600 mb-6">Create a task list to start managing your project</p>
                  <button
                    type="button"
                    onClick={() => setIsCreateColumnModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Task List</span>
                  </button>
                  <ColumnModal
                    mode="create"
                    projectId={id!}
                    isOpen={isCreateColumnModalOpen}
                    onClose={() => setIsCreateColumnModalOpen(false)}
                    onSuccess={fetchTaskLists}
                  />
                </div>
              </div>
            );
          }

          if (!isLoading && !error && taskLists.length > 0) {
            return (
              <>
                <TaskFilterBar
                  filters={filterState}
                  onFilterChange={setFilterState}
                  onResetFilters={() => setFilterState(DEFAULT_TASK_FILTER_STATE)}
                  members={members}
                  currentUserId={user?.id}
                />
                {activeView === 'board' && (
                  <BoardView
                    taskLists={filteredTaskLists}
                    projectId={id!}
                    onTaskMove={handleTaskMove}
                    onTaskClick={openTask}
                    onTaskCreated={fetchTaskLists}
                    onTaskUpdated={fetchTaskLists}
                  />
                )}
                {activeView === 'list' && (
                  <ListView tasks={filteredTasks} onTaskClick={openTask} />
                )}
                {activeView === 'calendar' && <CalendarView tasks={filteredTasks} onTaskClick={openTask} />}
                {activeView === 'timeline' && <TimelineView tasks={filteredTasks} onTaskClick={openTask} />}
              </>
            );
          }

          return null;
        })()}
      </div>

      {drawerOpen && (
        <TaskDetailDrawer
          taskOverride={selectedTask}
          initialTab={drawerTab}
          onClose={closeTask}
          onCommentCountChange={handleCommentCountChange}
          onTaskUpdated={fetchTaskLists}
        />
      )}

      <ShareProjectModal
        projectId={Number(id || 0)}
        projectTitle={`Project #${id}`}
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onInvitationCreated={() => {
          setShareModalOpen(false);
        }}
      />

      <PendingMembersModal
        projectId={Number(id || 0)}
        projectTitle={`Project #${id}`}
        isOpen={pendingMembersModalOpen}
        onClose={() => setPendingMembersModalOpen(false)}
      />

      <ProjectMembersModal
        projectId={Number(id || 0)}
        projectTitle={`Project #${id}`}
        isOpen={membersModalOpen}
        onClose={() => setMembersModalOpen(false)}
      />

      <ProjectActivityDrawer
        projectId={Number(id || 0)}
        projectTitle={`Project #${id}`}
        isOpen={activityDrawerOpen}
        onClose={() => setActivityDrawerOpen(false)}
      />
    </div>
  );
}