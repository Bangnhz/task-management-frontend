import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Globe, Lock, Building2, CheckSquare } from 'lucide-react';
import { useMyProjects } from '../../../hooks/use-my-projects';
import { Skeleton } from '../../../components/common/loading-skeleton';
import type { ProjectCardDTO } from '../../../types/project';

function getProgress(p: ProjectCardDTO): number {
  // Since completedTasks is removed, we can't calculate progress
  return 0;
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
    <span className={`inline-flex items-center gap-1 text-[0.7rem] font-semibold px-2 py-0.5 rounded-full border ${bgClass} shrink-0`}>
      <IconComponent className="w-3 h-3 shrink-0" />
      <span>{visibility}</span>
    </span>
  );
}

export default function ProjectGrid() {
  const { projects, isLoading, error } = useMyProjects();
  const navigate = useNavigate();

  return (
    <section className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 m-0">Your Projects</h2>
          <p className="text-xs text-slate-400 mt-1 m-0">Progress and recent updates</p>
        </div>
        <Link to="/projects" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 no-underline">
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-3 gap-3.5 max-lg:grid-cols-2">
          {[1,2,3].map((n) => (
            <div key={n} className="border border-slate-200/60 rounded-xl p-4 flex flex-col gap-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <p className="text-xs text-slate-400 text-center py-6">Failed to load projects.</p>
      )}

      {!isLoading && !error && projects.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-6">No projects yet.</p>
      )}

      {!isLoading && !error && projects.length > 0 && (
        <div className="grid grid-cols-3 gap-3.5 max-lg:grid-cols-2 max-md:grid-cols-1">
          {projects.slice(0, 6).map((p) => {
            const progress = getProgress(p);
            return (
              <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
                className="border border-slate-200/60 rounded-xl p-4 flex flex-col gap-2.5 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 m-0 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                  {getVisibilityBadge(p.visibility) ?? (
                    <span className="text-[0.7rem] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap">Active</span>
                  )}
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                      style={{ width: `${progress}%` }} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">{progress}%</span>
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                  {p.totalTasks ?? 0} tasks
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
