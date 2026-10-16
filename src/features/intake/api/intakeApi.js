import { apiClient } from '../../../lib/apiClient.js';

export async function recordIntake(payload) {
  const { data } = await apiClient.post('/intake', payload);
  return data;
}
