import { apiClient } from '../../../lib/apiClient.js';
import { getMediaUrl } from '../../../lib/media.js';

export async function getCatalog(params) {
  const { data } = await apiClient.get('/items', { params });
  return data?.data ?? data;
}

export async function getCatalogItem(itemId) {
  const { data } = await apiClient.get(`/items/${encodeURIComponent(itemId)}`);
  return data?.data ?? data;
}

const labels = { found: 'Temuan', lost: 'Hilang', general: 'Umum', sensitive: 'Sensitif' };
const statusAliases = {
  pending: 'WAITING_AT_SECURITY',
  secured: 'AVAILABLE',
  claimed: 'CLAIMED',
};
export function normalizeItem(raw = {}) {
  const typeKey = String(raw.report_type ?? raw.type ?? '').toLowerCase();
  const categoryKey = String(raw.category ?? raw.category_name ?? '').toLowerCase();
  const type = labels[typeKey] ?? raw.type ?? 'Temuan';
  const category = labels[categoryKey] ?? raw.category ?? (Number(raw.is_sensitive) ? 'Sensitif' : 'Umum');
  const dateValue = raw.found_date ?? raw.date ?? raw.created_at;
  return {
    ...raw,
    id: String(raw.id ?? raw.item_id),
    name: raw.name ?? raw.item_name ?? 'Barang',
    location: raw.location ?? raw.found_location ?? '-',
    date: dateValue ? new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(new Date(dateValue)) : '-',
    fullDate: dateValue,
    status: statusAliases[String(raw.status ?? '').toLowerCase()] ??
      String(raw.status ?? '').toUpperCase(),
    type, category,
    description: raw.description ?? '',
    imageUrl: getMediaUrl(raw.image_url ?? raw.imageUrl ?? raw.image_path),
    claimQuestions: raw.claimQuestions ?? raw.claim_questions ?? [],
    icon: raw.icon ?? (category === 'Sensitif' ? 'wallet' : 'backpack'),
  };
}
