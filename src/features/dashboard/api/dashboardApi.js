import { apiClient } from '../../../lib/apiClient.js';

export async function getDashboardSummary(params) {
  const { data } = await apiClient.get('/admin/dashboard', { params });
  return data;
}
