import { apiClient } from '../../../lib/apiClient.js';

export async function getAdminItems(params) {
  const { data } = await apiClient.get('/admin/items', { params });
  return data;
}

export async function approveAdminItem(itemId) {
  const { data } = await apiClient.patch(`/admin/items/${encodeURIComponent(itemId)}/approve`);
  return data;
}

export async function rejectAdminItem(itemId, payload) {
  const { data } = await apiClient.patch(`/admin/items/${encodeURIComponent(itemId)}/reject`, payload);
  return data;
}

export async function restoreAdminItem(itemId) {
  const { data } = await apiClient.patch(`/admin/items/${encodeURIComponent(itemId)}/restore`);
  return data;
}

export async function getAdminClaims(status = 'all') {
  const { data } = await apiClient.get('/admin/claims', { params: { status } });
  return data;
}

export async function processAdminClaim(claimId, status) {
  const { data } = await apiClient.put(`/admin/claims/${encodeURIComponent(claimId)}/process`, { status });
  return data;
}
