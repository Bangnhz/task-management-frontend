import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useWorkspaces } from '../../hooks/use-workspaces';
import WorkspaceService from '../../services/workspace.service';
import EmptyState from '../../components/common/empty-state';
import { Skeleton } from '../../components/common/loading-skeleton';
import CreateProjectForm from '../../components/project/create-project-form';
import type { ProjectCardDTO } from '../../types/project';
import type { WorkspaceResponseDTO } from '../../types/workspace';

interface WorkspaceWithProjects extends WorkspaceResponseDTO {
  projects: ProjectCardDTO[];
  loadingProjects: boolean;
  expanded: boolean;
}

export default function WorkspacesPage() {
  const navigate = useNavigate();
  const [viewMy, setViewMy] = useState(true);
  const [workspacesWithProjects, setWorkspacesWithProjects] = useState<WorkspaceWithProjects[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [selectedWorkspaceForProject, setSelectedWorkspaceForProject] = useState<WorkspaceResponseDTO | null>(null);

  const { workspaces, isLoading, error, refetch, addWorkspace } = useWorkspaces();

  useEffect(() => {
    if (workspaces.length > 0) {
      setWorkspacesWithProjects(
        workspaces.map(ws => ({
          ...ws,
          projects: [],
          loadingProjects: false,
          expanded: false
        }))
      );
    } else {
      setWorkspacesWithProjects([]);
    }
  }, [workspaces]);

  const toggleWorkspace = (workspaceId: number) => {
    setWorkspacesWithProjects(prev =>
      prev.map(ws => {
        if (ws.id === workspaceId) {
          const newExpanded = !ws.expanded;

          if (newExpanded && ws.projects.length === 0 && !ws.loadingProjects) {
            loadProjectsForWorkspace(ws.id);
          }

          return { ...ws, expanded: newExpanded };
        }
        return ws;
      })
    );
  };

  const loadProjectsForWorkspace = async (workspaceId: number) => {
    setWorkspacesWithProjects(prev =>
      prev.map(ws =>
        ws.id === workspaceId ? { ...ws, loadingProjects: true } : ws
      )
    );

    try {
      const response = await WorkspaceService.getProjectsByWorkspace(workspaceId);
      setWorkspacesWithProjects(prev =>
        prev.map(ws =>
          ws.id === workspaceId
            ? { ...ws, projects: response.data, loadingProjects: false }
            : ws
        )
      );
    } catch (err) {
      console.error('Failed to load projects:', err);
      setWorkspacesWithProjects(prev =>
        prev.map(ws =>
          ws.id === workspaceId
            ? { ...ws, loadingProjects: false }
            : ws
        )
      );
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      setCreateError('Workspace name is required');
      return;
    }

    if (newWorkspaceName.length > 100) {
      setCreateError('Workspace name must not exceed 100 characters');
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const response = await WorkspaceService.createWorkspace({ name: newWorkspaceName.trim() });
      const createdWorkspace = response.data;

      addWorkspace(createdWorkspace);

      setNewWorkspaceName('');
      setShowCreateModal(false);
    } catch (err: any) {
      console.error('Failed to create workspace:', err);
      setCreateError(err?.response?.data?.message || 'Failed to create workspace');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenCreateModal = () => {
    setNewWorkspaceName('');
    setCreateError(null);
    setShowCreateModal(true);
  };

  return (
    <div className="px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 m-0">Workspaces</h1>
          <p className="text-sm text-slate-500 mt-1 m-0">
            Manage your workspaces and projects
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter tabs */}
          <div className="flex gap-0.5 bg-slate-200/60 rounded-lg p-1">
            {([
              { key: true, label: 'Mine' },
              { key: false, label: 'All' },
            ]).map((tab) => (
              <button
                key={String(tab.key)}
                onClick={() => setViewMy(tab.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer
                  ${viewMy === tab.key ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {viewMy && (
            <button
              onClick={handleOpenCreateModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              + New Workspace
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-700 m-0">{error}</p>
          <button
            onClick={refetch}
            className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && workspacesWithProjects.length === 0 && (
        <EmptyState
          title="No workspaces yet"
          description={viewMy
            ? "You haven't joined any workspaces yet. Create one or request an invitation."
            : "No workspaces in the system."
          }
          action={viewMy ? (
            <button
              onClick={handleOpenCreateModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Create New Workspace
            </button>
          ) : undefined}
        />
      )}

      {/* Workspace grid */}
      {!isLoading && !error && workspaces.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              onClick={() => navigate(`/projects?workspaceId=${workspace.id}`)}
              className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {workspace.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {new Date(workspace.createdAt).toLocaleDateString('en-US')}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 m-0 mb-2 group-hover:text-indigo-600 transition-colors">
                {workspace.name}
              </h3>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  ID: {workspace.id}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWorkspaceForProject(workspace);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    title="Create a new project in this workspace"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Project</span>
                  </button>
                  <span className="text-xs font-medium text-slate-400 group-hover:text-indigo-600 transition-colors">
                    View →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {selectedWorkspaceForProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 m-0">
                Create new project in <span className="text-indigo-600">{selectedWorkspaceForProject.name}</span>
              </h3>
              <button
                onClick={() => setSelectedWorkspaceForProject(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <CreateProjectForm
              workspaceId={selectedWorkspaceForProject.id}
              onSuccess={() => {
                const wsId = selectedWorkspaceForProject.id;
                setSelectedWorkspaceForProject(null);
                navigate(`/projects?workspaceId=${wsId}`);
              }}
              onCancel={() => setSelectedWorkspaceForProject(null)}
            />
          </div>
        </div>
      )}

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 m-0">Create New Workspace</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 m-0">{createError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Enter workspace name..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  maxLength={100}
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  {newWorkspaceName.length}/100 characters
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateWorkspace}
                  disabled={isCreating || !newWorkspaceName.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {isCreating ? 'Creating...' : 'Create workspace'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}