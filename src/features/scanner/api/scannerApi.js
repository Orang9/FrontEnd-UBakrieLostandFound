import { apiClient } from '../../../lib/apiClient.js';

export async function validateTicket(qrValue) {
  const { data } = await apiClient.post('/v2/claims/validate-qr', {
    qr_token: qrValue,
  });
  return data;
}
