import axios from 'axios';

const getToken = () => localStorage.getItem('nicecards_token');

/**
 * User-facing API client. Automatically attaches the user JWT.
 */
const api = axios.create({
  baseURL: `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api`,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Uniform error message extraction
export const getErrorMessage = (error, fallback = 'Something went wrong. Please try again.') =>
  error?.response?.data?.message || error?.message || fallback;

export default api;
