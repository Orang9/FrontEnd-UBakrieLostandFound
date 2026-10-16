import { apiClient } from '../../../lib/apiClient.js';

export async function createClaim(itemId, payload) {
  const { data } = await apiClient.post(
    `/items/${encodeURIComponent(itemId)}/claims`,
    payload,
  );
  return data;
}

export async function getClaims(params) {
  const { data } = await apiClient.get('/claims', { params });
  return data;
}

export async function reviewClaim(claimId, decision) {
  const { data } = await apiClient.patch(
    `/claims/${encodeURIComponent(claimId)}`,
    decision,
  );
  return data;
}
