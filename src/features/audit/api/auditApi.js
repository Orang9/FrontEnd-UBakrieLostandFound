import { apiClient } from '../../../lib/apiClient.js';

export async function getAuditEvents(params) {
  const { data } = await apiClient.get('/admin/audit', {
    params: {
      actorId: params.actor,
      action: params.eventType,
      startDate: params.dateFrom,
      endDate: params.dateTo,
    },
  });
  return data;
}
