import { env } from './env.js';

const apiOrigin = env.apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');

export function getMediaUrl(value) {
  if (!value) return null;

  const imageValue = String(value);
  if (/^https?:\/\//i.test(imageValue)) return imageValue;

  const filename = imageValue.split(/[\\/]/).pop();
  return filename ? `${apiOrigin}/uploads/${encodeURIComponent(filename)}` : null;
}
