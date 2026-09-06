import api from './api';
import type { UserMentionDTO } from '../types/user';

const userService = {
  searchMentionUsers: (projectId?: number, query: string = '') => {
    if (!projectId) return Promise.resolve({ data: [] as UserMentionDTO[] });
    return api.get<UserMentionDTO[]>(`/projects/${projectId}/members/mention-suggestions`, {
      params: { query },
    });
  },
};

export default userService;