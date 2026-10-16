import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_SIZE_MB,
} from '../../../constants/limits.js';

export function ProofUpload({ onChange }) {
  return (
    <label className="form-field">
      Bukti pendukung
      <input
        className="text-input"
        type="file"
        accept={ACCEPTED_PHOTO_TYPES.join(',')}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
      <span>JPG atau PNG, maksimal {MAX_PHOTO_SIZE_MB} MB.</span>
    </label>
  );
}
