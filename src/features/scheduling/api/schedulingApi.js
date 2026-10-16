import { apiClient } from '../../../lib/apiClient.js';

export async function getSlots(params) {
  const { data } = await apiClient.get('/slots', { params });
  return data;
}

export async function createSchedule(payload) {
  const { data } = await apiClient.post('/schedules', payload);
  return data;
}
