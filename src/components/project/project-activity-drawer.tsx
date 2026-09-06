import React from 'react';
import { History, X } from 'lucide-react';
import ActivityTimeline from '../activity/ActivityTimeline';

interface ProjectActivityDrawerProps {
  projectId: number | string;
  projectTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectActivityDrawer({
  projectId,
  projectTitle,
  isOpen,
  onClose,
}: ProjectActivityDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-slate-900/30 z-40 transition-opacity"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Project Activity Feed"
        className="fixed top-0 right-0 bottom-0 w-full max-w-[480px] bg-white border-l border-slate-200 shadow-[-8px_0_32px_rgba(15,23,42,.12)] z-[41] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 m-0">Activity Log</h2>
              <p className="text-xs text-slate-500 m-0">{projectTitle || `Project #${projectId}`}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Timeline Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <ActivityTimeline projectId={projectId} />
        </div>
      </aside>
    </>
  );
}
