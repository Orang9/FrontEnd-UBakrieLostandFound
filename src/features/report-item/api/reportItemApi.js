import { apiClient } from '../../../lib/apiClient.js';

export async function createItemReport(payload) {
  const formData = payload instanceof FormData ? payload : Object.entries(payload).reduce((form, [key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value);
    return form;
  }, new FormData());
  const { data } = await apiClient.post('/items/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data?.data ?? data;
}
