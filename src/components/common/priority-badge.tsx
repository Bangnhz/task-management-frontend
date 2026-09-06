import React from 'react';
import { cn } from '../../utils/cn';
import type { Priority } from '../../types/task';

const map: Record<Priority, string> = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-800',
  Low:    'bg-indigo-100 text-indigo-700',
  Urgent: 'bg-purple-100 text-purple-700',
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[0.73rem] font-semibold whitespace-nowrap', map[priority])}>
      {priority}
    </span>
  );
}
