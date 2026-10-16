import axios from 'axios';
import { env } from './env.js';

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { Accept: 'application/json' },
  timeout: 15_000,
});

apiClient.interceptors.request.use((config) => {
  const session = localStorage.getItem('ubakrie-lf-auth');
  if (session) {
    const { token } = JSON.parse(session);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
