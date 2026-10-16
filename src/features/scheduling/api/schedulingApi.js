import { apiClient } from '../../../lib/apiClient.js';

export async function getSlots(params) {
  const { data } = await apiClient.get('/slots', { params });
  return data;
}

export async function createSchedule(payload) {
  const { claimId, ...schedule } = payload;
  const { data } = await apiClient.post(
    `/claims/${encodeURIComponent(claimId)}/schedule`,
    schedule,
  );
  return data;
}
