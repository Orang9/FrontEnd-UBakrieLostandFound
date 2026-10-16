import { apiClient } from '../../../lib/apiClient.js';

export async function recordIntake(payload) {
  const { data } = await apiClient.post('/admin/items', payload);
  return data;
}
