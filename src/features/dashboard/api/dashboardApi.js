import { apiClient } from '../../../lib/apiClient.js';

export async function getDashboardSummary(params) {
  const { data } = await apiClient.get('/admin/dashboard/stats', { params });
  return data;
}

export async function getAdminItems(params) {
  const { data } = await apiClient.get('/admin/items', { params });
  return data;
}

export async function secureItem(itemId, isSensitive) {
  const { data } = await apiClient.put(
    `/admin/items/${encodeURIComponent(itemId)}/secure`,
    { is_sensitive: isSensitive },
  );
  return data;
}

export async function batchSecureItems(itemIds) {
  const { data } = await apiClient.put('/admin/items/batch-secure', {
    item_ids: itemIds,
  });
  return data;
}

export async function downloadMonthlyReport(params) {
  const { data, headers } = await apiClient.get('/admin/reports/monthly', {
    params,
    responseType: 'blob',
  });
  return { blob: data, contentDisposition: headers['content-disposition'] };
}
