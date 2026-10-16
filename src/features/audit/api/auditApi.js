import { apiClient } from '../../../lib/apiClient.js';

export async function getAuditEvents(params) {
  const { data } = await apiClient.get('/admin/audit', { params });
  return data;
}
