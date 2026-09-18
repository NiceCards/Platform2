import axios from 'axios';

const getAdminToken = () => localStorage.getItem('nicecards_admin_token');

/**
 * Admin API client. Automatically attaches the admin JWT.
 */
const adminApi = axios.create({
  baseURL: `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api`,
});

adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const isAdminLoggedIn = () => Boolean(localStorage.getItem('nicecards_admin_token'));

export default adminApi;
