import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: đính JWT vào mọi request ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: xử lý lỗi 401 & log lỗi frontend ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const method = error.config?.method?.toUpperCase();
    const data = error.response?.data;

    console.error(
      `🚨 [Frontend API Error ${status || 'NET_ERR'}] ${method} ${url}:`,
      data?.message || data || error.message
    );

    if (status === 401) {
      const isLoginPage = window.location.pathname === '/login' ||
                          window.location.pathname === '/register';

      // Chỉ redirect nếu KHÔNG đang ở trang login/register
      if (!isLoginPage) {
        localStorage.removeItem('access_token');

        import('../store/use-auth-store').then(({ useAuthStore }) => {
          useAuthStore.getState().clearAuth();
        });

        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
