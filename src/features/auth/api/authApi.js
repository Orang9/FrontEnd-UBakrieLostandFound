import { apiClient } from '../../../lib/apiClient.js';

export async function loginStudent(credentials) {
  const { data } = await apiClient.post('/auth/login', credentials);
  return data;
}

export async function loginAdmin(credentials) {
  const { data } = await apiClient.post('/auth/admin/login', credentials);
  return data;
}

export async function registerStudent(payload) {
  const { data } = await apiClient.post('/auth/register', payload);
  return data;
}
