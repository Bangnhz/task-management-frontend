import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import TopHeader from './top-header';
import CommandMenu from './command-menu';
import TaskDetailDrawer from '../task/task-detail-drawer';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopHeader />
        <main className="flex-1 flex flex-col gap-5 p-6 min-w-0">
          <Outlet />
        </main>
      </div>
      <CommandMenu />
      <TaskDetailDrawer />
    </div>
  );
}
