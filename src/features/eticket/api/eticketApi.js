import { apiClient } from '../../../lib/apiClient.js';

export async function getTicket(claimId) {
  const { data } = await apiClient.get(
    `/v2/claims/${encodeURIComponent(claimId)}/qr-token`,
  );
  return data;
}
