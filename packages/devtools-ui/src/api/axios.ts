import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:4356/api' : '/api',
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/';
    }

    return Promise.reject(error);
  },
);
