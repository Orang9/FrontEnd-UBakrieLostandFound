import { apiClient } from '../../../lib/apiClient.js';

export async function getProfile() {
  const { data } = await apiClient.get('/profile');
  return data;
}
