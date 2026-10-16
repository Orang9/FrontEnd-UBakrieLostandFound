import { apiClient } from '../../../lib/apiClient.js';

export async function getCatalog(params) {
  const { data } = await apiClient.get('/items', { params });
  return data;
}

export async function getCategories() {
  const { data } = await apiClient.get('/categories');
  return data;
}

export async function getCatalogItem(itemId) {
  const { data } = await apiClient.get(`/items/${encodeURIComponent(itemId)}`);
  return data;
}
