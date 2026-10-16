import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_SIZE_BYTES,
} from '../../../constants/limits.js';

export function validateReportPhoto(file) {
  const selectedFile =
    typeof FileList !== 'undefined' && file instanceof FileList
      ? file.item(0)
      : file;
  if (!selectedFile) return true;
  if (!ACCEPTED_PHOTO_TYPES.includes(selectedFile.type))
    return 'Foto harus berformat JPG atau PNG.';
  if (selectedFile.size > MAX_PHOTO_SIZE_BYTES)
    return 'Ukuran foto maksimal 5 MB.';
  return true;
}
