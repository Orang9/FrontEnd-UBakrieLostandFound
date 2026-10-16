import { apiClient } from '../../../lib/apiClient.js';

export async function getHomeSummary() {
  const { data } = await apiClient.get('/home');
  return data;
}
