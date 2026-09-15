import api from './api';
import type {
  RegisterRequestDTO,
  LoginRequestDTO,
  AuthResponseDTO,
} from '../types/auth';

const AuthService = {
  register: (payload: RegisterRequestDTO) =>
    api.post<AuthResponseDTO>('/auth/register', payload),
  login: (payload: LoginRequestDTO) =>
    api.post<AuthResponseDTO>('/auth/login', payload),
  logout: () => {
    localStorage.removeItem('access_token');
  },
};

export default AuthService;
