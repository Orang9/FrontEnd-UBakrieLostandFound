import { apiClient } from '../../../lib/apiClient.js';

export async function createItemReport(payload) {
  const { data } = await apiClient.post('/items', payload);
  return data;
}
