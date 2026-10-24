import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_SIZE_BYTES,
} from '../../../constants/limits.js';

export function validateClaimAnswers(answers, expectedCount = 2) {
  if (!Array.isArray(answers) || answers.length !== expectedCount) {
    return `Jawab semua ${expectedCount} pertanyaan verifikasi.`;
  }
  if (answers.some((answer) => typeof answer !== 'string' || !answer.trim())) {
    return 'Semua jawaban verifikasi wajib diisi.';
  }
  return true;
}

export function validateClaimEvidence(fileList) {
  const file = fileList?.item?.(0);
  if (!file) return true;
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
    return 'Bukti harus berformat JPG atau PNG.';
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return 'Ukuran bukti maksimal 5 MB.';
  }
  return true;
}
