import { apiClient } from '../../../lib/apiClient.js';

export async function getTicket(ticketId) {
  try {
    const { data } = await apiClient.get(`/tickets/${encodeURIComponent(ticketId)}`);
    return data?.data ?? data;
  } catch (error) {
    const { data } = await apiClient.get(`/v2/claims/${encodeURIComponent(ticketId)}`);
    return data?.data ?? data;
  }
}
