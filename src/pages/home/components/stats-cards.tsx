import { useEffect, useState } from 'react';
import TaskService from '../../../services/task.service';
import type { TaskStatistics } from '../../../services/statistics.service';
import type { TaskSummaryDTO } from '../../../types/task';

interface StatConfig {
  title: string;
  description: string;
  dot: string;
  field: keyof TaskStatistics;
}

const STATS_CONFIG: StatConfig[] = [
  { title: 'My Tasks',    description: 'Assigned to you',  dot: 'bg-indigo-600', field: 'myTasks'    },
  { title: 'In Progress', description: 'Currently active', dot: 'bg-blue-600',   field: 'inProgress' },
  { title: 'Due Soon',    description: 'Next 7 days',      dot: 'bg-amber-500',  field: 'dueSoon'    },
  { title: 'Completed',   description: 'This month',       dot: 'bg-emerald-600',field: 'completed'  },
];

const EMPTY: TaskStatistics = { myTasks: 0, inProgress: 0, dueSoon: 0, completed: 0 };

/** Tính statistics từ danh sách TaskSummaryDTO thay vì gọi API riêng */
function calculateStats(tasks: TaskSummaryDTO[]): TaskStatistics {
  const now       = new Date();
  const in7Days   = new Date(now.getTime() + 7 * 86_400_000);

  return {
    myTasks:    tasks.length,
    inProgress: tasks.filter((t) => t.listTitle?.toLowerCase().includes('in progress')).length,
    dueSoon:    tasks.filter((t) => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      return due >= now && due <= in7Days;
    }).length,
    completed:  tasks.filter((t) => t.listTitle?.toLowerCase().includes('done') ||
                                    t.listTitle?.toLowerCase().includes('completed')).length,
  };
}

export default function StatsCards() {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats]         = useState<TaskStatistics>(EMPTY);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setIsLoading(true);

    TaskService.getTasksByUserId()
      .then((res) => {
        setStats(calculateStats(res.data));
      })
      .catch((err: any) => {
        if (err?.response?.status !== 401) {
          console.error('Error loading task statistics:', err);
        }
        setStats(EMPTY);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section className="grid grid-cols-4 gap-3.5 max-lg:grid-cols-2 max-sm:grid-cols-1">
      {STATS_CONFIG.map((stat) => (
        <div
          key={stat.title}
          className="bg-white border border-slate-200/60 rounded-2xl px-5 py-4 flex flex-col gap-2.5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 m-0">{stat.title}</p>
            <span className={`w-2 h-2 rounded-full ${stat.dot}`} aria-hidden="true" />
          </div>
          <p className="text-[2rem] font-extrabold text-slate-900 leading-none m-0">
            {isLoading ? '…' : stats[stat.field]}
          </p>
          <p className="text-[0.78rem] text-slate-400 m-0">{stat.description}</p>
        </div>
      ))}
    </section>
  );
}
