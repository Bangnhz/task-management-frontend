import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  Globe, 
  Lock, 
  Building2, 
  Clock, 
  CheckSquare, 
  FolderKanban, 
  AlertCircle 
} from 'lucide-react';
import { useMyProjects } from '../../hooks/use-my-projects';
import { useWorkspaces } from '../../hooks/use-workspaces';
import ProjectService from '../../services/project.service';
import { Skeleton } from '../../components/common/loading-skeleton';
import EmptyState from '../../components/common/empty-state';
import CreateProjectForm from '../../components/project/create-project-form';
import type { ProjectCardDTO } from '../../types/project';
import type { WorkspaceResponseDTO } from '../../types/workspace';

const VIEWS = ['Grid', 'List'] as const;
type View = typeof VIEWS[number];

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get('workspaceId');

  const { projects: myProjects, error: errorMy, refetch: refetchMy } = useMyProjects();
  const { workspaces } = useWorkspaces();
  const [projects, setProjects] = useState<ProjectCardDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceResponseDTO | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [view, setView] = useState<View>('Grid');
  const [search, setSearch] = useState('');

  // Load workspace details when workspaceId changes
  useEffect(() => {
    if (workspaceId && workspaces.length > 0) {
      const workspace = workspaces.find(w => w.id === parseInt(workspaceId));
      setCurrentWorkspace(workspace || null);
    } else {
      setCurrentWorkspace(null);
    }
  }, [workspaceId, workspaces]);

  // Load projects based on workspaceId
  useEffect(() => {
    const loadProjects = async () => {
      if (workspaceId) {
        setIsLoading(true);
        setError(null);
        try {
          const response = await ProjectService.getProjectsByWorkspace(parseInt(workspaceId));
          setProjects(response.data);
        } catch (err: any) {
          setError(err?.response?.data?.message ?? 'Failed to load workspace projects.');
        } finally {
          setIsLoading(false);
        }
      } else {
        setProjects(myProjects);
        setError(errorMy);
      }
    };

    loadProjects();
  }, [workspaceId, myProjects, errorMy]);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleGoBackToWorkspaces = () => {
    navigate('/workspaces');
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {currentWorkspace && (
              <button 
                onClick={handleGoBackToWorkspaces}
                className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Workspaces</span>
              </button>
            )}
          </div>
          <h1 className="text-lg font-bold text-slate-900 m-0">
            {currentWorkspace ? `Projects in ${currentWorkspace.name}` : 'Projects'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 m-0">
            {currentWorkspace 
              ? `All projects in workspace "${currentWorkspace.name}"`
              : 'All projects you\'re part of'}
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-lg px-3 py-2 flex-1 min-w-[200px] max-w-xs focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects…"
            className="flex-1 border-none outline-none text-sm text-slate-900 placeholder:text-slate-400 bg-transparent" />
        </div>
        <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
          {VIEWS.map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${view === v ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-900'}`}>
              {v === 'Grid' ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
              <span>{v}</span>
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2">
          {[1,2,3].map((n) => (
            <div key={n} className="bg-white border border-slate-200/60 rounded-2xl p-5 flex flex-col gap-3">
              <Skeleton className="h-4 w-1/2" /><Skeleton className="h-2 w-full" /><Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <EmptyState icon={<AlertCircle className="w-10 h-10 text-amber-500" />} title="Failed to load projects" description={error}
          action={<button onClick={() => workspaceId ? setProjects([]) : refetchMy()} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50 cursor-pointer">Retry</button>} />
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <EmptyState icon={<FolderKanban className="w-10 h-10 text-slate-300" />} title={search ? `No results for "${search}"` : 'No projects yet'}
          description={search ? 'Try a different search term.' : 'Create your first project to get started.'} />
      )}

      {!isLoading && !error && filtered.length > 0 && (
        view === 'Grid' ? <GridView projects={filtered} /> : <ListView projects={filtered} />
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 m-0">Create New Project</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <CreateProjectForm
              workspaceId={workspaceId ? parseInt(workspaceId) : undefined}
              workspaces={workspaces}
              onSuccess={() => {
                setShowCreateModal(false);
                if (workspaceId) {
                  ProjectService.getProjectsByWorkspace(parseInt(workspaceId))
                    .then(res => setProjects(res.data));
                } else {
                  refetchMy();
                }
              }}
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function getVisibilityBadge(visibility?: string) {
  if (!visibility) return null;
  const upper = visibility.toUpperCase();
  let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let IconComponent = Globe;
  
  if (upper === 'PUBLIC') {
    bgClass = 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
    IconComponent = Globe;
  } else if (upper === 'PRIVATE') {
    bgClass = 'bg-amber-50 text-amber-700 border-amber-200/60';
    IconComponent = Lock;
  } else if (upper === 'WORKSPACE') {
    bgClass = 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
    IconComponent = Building2;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-[0.7rem] font-semibold px-2.5 py-0.5 rounded-full border ${bgClass}`}>
      <IconComponent className="w-3 h-3 shrink-0" />
      <span>{visibility}</span>
    </span>
  );
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

function GridView({ projects }: { projects: ProjectCardDTO[] }) {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
      {projects.map((p) => {
        return (
          <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
            className="bg-white border border-slate-200/60 rounded-2xl p-5 flex flex-col gap-3 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {p.name.slice(0, 2).toUpperCase()}
              </div>
              {getVisibilityBadge(p.visibility) ?? (
                <span className="text-[0.7rem] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Active</span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900 m-0 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                  style={{ width: `0%` }} role="progressbar" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100} />
              </div>
              <span className="text-xs font-semibold text-slate-600 shrink-0">0%</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 mt-1">
              <span className="flex items-center gap-1.5 text-slate-500">
                <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                {p.totalTasks ?? 0} tasks
              </span>
              {p.updatedAt && (
                <span title={p.updatedAt} className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(p.updatedAt)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ projects }: { projects: ProjectCardDTO[] }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-[1fr_140px_110px_140px] gap-4 px-5 py-3 border-b border-slate-100 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">
        <span>Project</span><span>Visibility</span><span>Tasks</span><span>Updated At</span>
      </div>
      <div className="divide-y divide-slate-100">
        {projects.map((p) => {
          return (
            <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
              className="grid grid-cols-[1fr_140px_110px_140px] gap-4 items-center px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <p className="text-sm font-semibold text-slate-900 m-0 truncate group-hover:text-indigo-600 transition-colors">{p.name}</p>
              </div>
              <div>
                {getVisibilityBadge(p.visibility) ?? <span className="text-xs text-slate-400">-</span>}
              </div>
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                {p.totalTasks ?? 0} tasks
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                {p.updatedAt ? (
                  <>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(p.updatedAt)}</span>
                  </>
                ) : '-'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}