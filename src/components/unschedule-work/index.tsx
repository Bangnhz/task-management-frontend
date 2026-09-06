import React, { useState, useMemo } from 'react';
import type { Task } from '../../types/task';
import PriorityBadge from '../common/priority-badge';
import { Search, AlertCircle, GripVertical } from 'lucide-react';

export interface UnscheduleWorkProps {
    unscheduledTasks: Task[];
    onTaskClick?: (task: Task, tab?: 'details' | 'comments') => void;
}

export default function UnscheduleWork({ unscheduledTasks, onTaskClick }: UnscheduleWorkProps) {
    const [searchUnscheduled, setSearchUnscheduled] = useState('');

    const searchedUnscheduledTasks = useMemo(() => {
        if (!searchUnscheduled.trim()) return unscheduledTasks;
        const q = searchUnscheduled.toLowerCase();
        return unscheduledTasks.filter(
            (t) => t.title.toLowerCase().includes(q) || (t.status && t.status.toLowerCase().includes(q))
        );
    }, [unscheduledTasks, searchUnscheduled]);

    return (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <div>
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 m-0">Unscheduled work</h3>
                    <span className="px-2 py-0.5 rounded-full text-[0.68rem] font-bold bg-amber-100 text-amber-800">
                        {unscheduledTasks.length} items
                    </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 m-0 leading-relaxed">
                    Drag each work item onto the calendar to set a due date for the work.
                </p>
            </div>

            {/* Search unscheduled items */}
            <div className="relative">
                <input
                    type="text"
                    value={searchUnscheduled}
                    onChange={(e) => setSearchUnscheduled(e.target.value)}
                    placeholder="Search unscheduled items"
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all shadow-2xs"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* List of unscheduled items */}
            <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1">
                {searchedUnscheduledTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <AlertCircle className="w-5 h-5 text-slate-300 mb-1" />
                        <p className="text-xs text-slate-400 m-0">No unscheduled items</p>
                    </div>
                ) : (
                    searchedUnscheduledTasks.map((t) => (
                        <div
                            key={t.id}
                            draggable={true}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('taskId', t.id);
                                e.dataTransfer.setData('text/plain', t.id);
                            }}
                            onClick={() => onTaskClick?.(t, 'details')}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 hover:bg-indigo-50/50 border border-slate-200/60 hover:border-indigo-200 text-xs cursor-grab active:cursor-grabbing transition-all shadow-2xs group"
                            title="Drag and drop onto any date on the calendar to set due date"
                        >
                            <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                                <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0 group-hover:text-indigo-500 transition-colors" />
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-slate-800 group-hover:text-indigo-600 truncate m-0 transition-colors">
                                        {t.title}
                                    </p>
                                    <p className="text-[0.65rem] text-slate-400 font-medium m-0 mt-0.5">{t.status}</p>
                                </div>
                            </div>
                            <PriorityBadge priority={t.priority} />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
