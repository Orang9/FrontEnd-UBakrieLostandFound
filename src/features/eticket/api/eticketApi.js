import { apiClient } from '../../../lib/apiClient.js';

export async function getTicket(ticketId) {
  const { data } = await apiClient.get(
    `/tickets/${encodeURIComponent(ticketId)}`,
  );
  return data;
}
