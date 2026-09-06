import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 gap-3 text-center">
      {icon && <span className="text-3xl opacity-40">{icon}</span>}
      <p className="m-0 font-semibold text-[0.95rem] text-slate-900">{title}</p>
      {description && <p className="m-0 text-xs text-slate-500 max-w-[280px]">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
