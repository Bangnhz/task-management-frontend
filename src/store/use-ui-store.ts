import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  isSidebarOpen: boolean;
  isCommandMenuOpen: boolean;
  isTaskDrawerOpen: boolean;
  selectedTaskId: string | null;
  taskDrawerTab: 'details' | 'comments' | 'activities';
  isDarkMode: boolean;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  openCommandMenu: () => void;
  closeCommandMenu: () => void;

  openTaskDrawer: (taskId: string, tab?: 'details' | 'comments' | 'activities') => void;
  closeTaskDrawer: () => void;

  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      isCommandMenuOpen: false,
      isTaskDrawerOpen: false,
      selectedTaskId: null,
      taskDrawerTab: 'details',
      isDarkMode: false,

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      openCommandMenu: () => set({ isCommandMenuOpen: true }),
      closeCommandMenu: () => set({ isCommandMenuOpen: false }),

      openTaskDrawer: (taskId, tab = 'details') =>
        set({ isTaskDrawerOpen: true, selectedTaskId: taskId, taskDrawerTab: tab }),
      closeTaskDrawer: () =>
        set({ isTaskDrawerOpen: false, selectedTaskId: null, taskDrawerTab: 'details' }),

      toggleDarkMode: () =>
        set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'taskflow-ui', // key trong localStorage
      partialize: (state: UIState) => ({
        isDarkMode: state.isDarkMode,
        isSidebarOpen: state.isSidebarOpen,
      }),
    }
  )
);
