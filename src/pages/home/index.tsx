import React from 'react';
import StatsCards from './components/stats-cards';
import MyTasksSection from './components/my-tasks-section';
import ProjectGrid from './components/project-grid';
import RecentActivity from './components/recent-activity';

/**
 * Home Page — nội dung thuần, không có layout
 * Layout (Sidebar, TopHeader) được inject bởi DashboardLayout
 */
export default function HomePage() {
  return (
    <>
      <StatsCards />
      <MyTasksSection />
      <ProjectGrid />
      <RecentActivity />
    </>
  );
}
