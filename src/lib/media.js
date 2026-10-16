import { env } from './env.js';

export function getItemImageUrl(imagePath) {
  if (!imagePath) return '';
  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  const filename = imagePath.split(/[\\/]/).at(-1);
  if (!filename) return '';
  return `${new URL(env.apiBaseUrl).origin}/uploads/${encodeURIComponent(filename)}`;
}
