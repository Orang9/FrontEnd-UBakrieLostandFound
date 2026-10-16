import { apiClient } from '../../../lib/apiClient.js';

export async function validateTicket(qrValue) {
  const { data } = await apiClient.post('/tickets/validate', { qrValue });
  return data;
}
