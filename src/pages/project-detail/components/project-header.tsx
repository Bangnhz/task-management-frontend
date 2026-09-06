import React, { useState } from 'react';
import type { Project } from '../../../types/project';

type ViewType = 'list' | 'board' | 'calendar' | 'timeline';

interface ProjectHeaderProps {
  project: Project;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const views: { key: ViewType; label: string; icon: string }[] = [
  { key: 'list',     label: 'List',     icon: '☰' },
  { key: 'board',    label: 'Board',    icon: '⊞' },
  { key: 'calendar', label: 'Calendar', icon: '◫' },
  { key: 'timeline', label: 'Timeline', icon: '⟶' },
];

export default function ProjectHeader({ project, activeView, onViewChange }: ProjectHeaderProps) {
  return (
    <header style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
      {/* Info */}
      <div>
        <h1 style={{ fontSize: '1.2rem' }}>{project.name}</h1>
        <p style={{ margin: '4px 0 0' }}>{project.description}</p>
      </div>

      {/* View switcher */}
      <div className="tabs" role="tablist" aria-label="Project view">
        {views.map((v) => (
          <button
            key={v.key}
            role="tab"
            aria-selected={activeView === v.key}
            className={`tab ${activeView === v.key ? 'active' : ''}`}
            onClick={() => onViewChange(v.key)}
          >
            <span aria-hidden="true">{v.icon}</span> {v.label}
          </button>
        ))}
      </div>
    </header>
  );
}
