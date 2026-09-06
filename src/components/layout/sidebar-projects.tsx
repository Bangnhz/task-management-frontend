import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMyProjects } from '../../hooks/use-my-projects';

export default function SidebarProjects() {
  const [page, setPage] = useState(0);
  const pageSize = 4;
  const { projects, isLoading, totalPages, totalElements } = useMyProjects(page, pageSize);

  const handlePrev = () => {
    if (page > 0) setPage((p) => p - 1);
  };

  const handleNext = () => {
    if (page < totalPages - 1) setPage((p) => p + 1);
  };

  return (
    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-200/60">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <span>Recent Projects</span>
          {totalElements > 0 && (
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
              {totalElements}
            </span>
          )}
        </div>

        {/* Pagination Arrows */}
        {totalPages > 0 && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={handlePrev}
              disabled={page === 0 || isLoading}
              className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
              title="Previous page"
              type="button"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-slate-400 font-normal px-0.5">
              {page + 1}/{totalPages}
            </span>
            <button
              onClick={handleNext}
              disabled={page >= totalPages - 1 || isLoading}
              className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
              title="Next page"
              type="button"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Projects List */}
      <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto scrollbar-none min-h-[100px]">
        {isLoading ? (
          <div className="px-3 py-2 text-xs text-slate-400 animate-pulse">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="px-3 py-2 text-xs text-slate-400 italic">No projects joined yet</div>
        ) : (
          projects.map((project) => (
            <NavLink
              key={project.id}
              to={`/projects/${project.id}`}
              className={({ isActive }) =>
                `flex items-center gap-2.5 w-full px-3 py-1.5 rounded-lg text-sm transition-colors no-underline
                ${isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`
              }
            >
              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
              <span className="truncate">{project.name}</span>
            </NavLink>
          ))
        )}
      </div>
    </div>
  );
}
