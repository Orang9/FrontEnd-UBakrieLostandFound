import { apiClient } from '../../../lib/apiClient.js';

export async function createClaim(payload) {
  const { data } = await apiClient.post('/claims', payload);
  return data;
}

export async function getMyClaims() {
  const { data } = await apiClient.get('/claims/my');
  return data;
}

export async function getAdminClaims(params) {
  const { data } = await apiClient.get('/admin/claims', { params });
  return data;
}

export async function reviewClaim(claimId, decision) {
  const { data } = await apiClient.put(
    `/admin/claims/${encodeURIComponent(claimId)}/process`,
    decision,
  );
  return data;
}

export async function scheduleClaim(claimId, payload) {
  const { data } = await apiClient.post(
    `/claims/${encodeURIComponent(claimId)}/schedule`,
    payload,
  );
  return data;
}
