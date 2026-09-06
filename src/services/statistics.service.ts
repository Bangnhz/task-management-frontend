import api from './api';

export interface TaskStatistics {
  myTasks: number;
  inProgress: number;
  dueSoon: number;
  completed: number;
}

const StatisticsService = {

  getMyTaskStatistics: () => api.get<TaskStatistics>('/statistics/tasks'),
};

export default StatisticsService;
