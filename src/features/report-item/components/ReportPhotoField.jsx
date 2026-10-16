import { useEffect, useState } from 'react';
import { ImagePlus, LockKeyhole } from 'lucide-react';
import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_SIZE_MB,
} from '../../../constants/limits.js';
import { validateReportPhoto } from '../schemas/reportItemValidation.js';

function PhotoPreview({ file, isSensitive }) {
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="report-photo-preview">
      {previewUrl ? (
        <img
          className={isSensitive ? 'is-blurred' : ''}
          src={previewUrl}
          alt={
            isSensitive
              ? 'Pratinjau foto sensitif yang diburamkan'
              : 'Pratinjau foto barang'
          }
        />
      ) : (
        <ImagePlus size={28} aria-hidden="true" />
      )}
      {isSensitive && (
        <span
          className="report-photo-lock"
          aria-label="Foto sensitif diburamkan"
        >
          <LockKeyhole size={20} aria-hidden="true" />
        </span>
      )}
    </div>
  );
}

export function ReportPhotoField({ errors, isSensitive, register }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const photoField = register('photo', {
    required: 'Foto barang wajib diunggah.',
    validate: validateReportPhoto,
  });

  return (
    <div className="report-field">
      <span>Foto barang (JPG / PNG, maks {MAX_PHOTO_SIZE_MB} MB)</span>
      <div className="report-photo-row">
        <PhotoPreview file={selectedFile} isSensitive={isSensitive} />
        <label className="report-upload-button">
          <input
            type="file"
            accept={ACCEPTED_PHOTO_TYPES.join(',')}
            aria-label="Tambah foto barang"
            {...photoField}
            onChange={(event) => {
              photoField.onChange(event);
              setSelectedFile(event.target.files?.[0] ?? null);
            }}
          />
          <ImagePlus size={20} aria-hidden="true" />
          <span>Tambah</span>
        </label>
      </div>
      {errors.photo && (
        <span className="report-error">{errors.photo.message}</span>
      )}
      {isSensitive && (
        <aside className="report-blind-listing">
          <LockKeyhole size={20} aria-hidden="true" />
          <div>
            <strong>Blind Listing aktif</strong>
            <p>Foto barang Sensitif otomatis diburamkan di katalog publik.</p>
          </div>
        </aside>
      )}
    </div>
  );
}
