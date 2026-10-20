import { apiClient } from '../../../lib/apiClient.js';

export async function getSlots(params) {
  const { data } = await apiClient.get('/slots', { params });
  return data;
}

export async function createSchedule(payload) {
  const { data } = await apiClient.post('/schedules', payload);
  return data;
}

export async function getAdminSlots(params) {
  const { data } = await apiClient.get('/admin/slots', { params });
  return data;
}

export async function createAdminSlot(payload) {
  const { data } = await apiClient.post('/admin/slots', payload);
  return data;
}

export async function updateAdminSlot(slotId, payload) {
  const { data } = await apiClient.patch(`/admin/slots/${encodeURIComponent(slotId)}`, payload);
  return data;
}
