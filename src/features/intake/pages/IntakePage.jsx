import { useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { useToast } from '../../../app/providers/ToastProvider.jsx';
import { formatShortDate } from '../../../lib/format.js';
import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_SIZE_BYTES,
  MAX_PHOTO_SIZE_MB,
} from '../../../constants/limits.js';

const initialItems = [
  {
    id: 'intake-1',
    name: 'Kunci motor Honda',
    location: 'Parkiran B',
    date: '12 Okt',
    time: '10.15',
    category: 'Umum',
  },
  {
    id: 'intake-2',
    name: 'Payung biru',
    location: 'Aula',
    date: '11 Okt',
    time: '15.40',
    category: 'Umum',
  },
  {
    id: 'intake-3',
    name: 'Jaket hitam',
    location: 'Gedung A',
    date: '10 Okt',
    time: '13.05',
    category: 'Umum',
  },
  {
    id: 'intake-4',
    name: 'Kartu ATM',
    location: 'Kantin',
    date: '9 Okt',
    time: '11.30',
    category: 'Sensitif',
  },
  {
    id: 'intake-5',
    name: 'Flashdisk biru',
    location: 'Lab 2',
    date: '9 Okt',
    time: '16.20',
    category: 'Umum',
  },
];

const currentMonth = new Intl.DateTimeFormat('id-ID', {
  month: 'long',
  year: 'numeric',
}).format(new Date());

function formatTime(value) {
  return value.replace(':', '.');
}

export function IntakePage() {
  const [items, setItems] = useState(initialItems);
  const [activeTab, setActiveTab] = useState('daily');
  const [category, setCategory] = useState('Umum');
  const [photoName, setPhotoName] = useState('');
  const [photoError, setPhotoError] = useState('');
  const { notify } = useToast();

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    setPhotoError('');
    setPhotoName('');
    if (!file) return;

    if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError('Pilih foto berformat JPG atau PNG.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setPhotoError(`Ukuran foto maksimal ${MAX_PHOTO_SIZE_MB} MB.`);
      event.target.value = '';
      return;
    }
    setPhotoName(file.name);
  }

  function addIntake(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newItem = {
      id: `intake-${Date.now()}`,
      name: String(formData.get('name')).trim(),
      location: String(formData.get('location')).trim(),
      date: formatShortDate(new Date()),
      time: formatTime(String(formData.get('time'))),
      category,
    };

    setItems((currentItems) => [...currentItems, newItem]);
    event.currentTarget.reset();
    setCategory('Umum');
    setPhotoName('');
    setPhotoError('');
    notify(
      'Intake ditambahkan ke preview. Penyimpanan dan publikasi katalog memerlukan backend.',
      'info',
    );
  }

  const visibleCount = items.length;

  return (
    <div className="admin-page admin-intake-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Penerimaan barang</p>
          <h1>Intake Satpam</h1>
          <p className="admin-page-description">
            Catat barang temuan harian; setelah dicatat dan diterima, statusnya Tersedia.
          </p>
        </div>
        <span className="admin-intake-month">{currentMonth}</span>
      </header>

      <div className="admin-mobile-tabs intake-mobile-tabs" role="tablist">
        <button
          className={activeTab === 'daily' ? 'is-active' : ''}
          id="intake-daily-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === 'daily'}
          aria-controls="intake-daily-panel"
          onClick={() => setActiveTab('daily')}
        >
          Input Harian
        </button>
        <button
          className={activeTab === 'batch' ? 'is-active' : ''}
          id="intake-batch-tab"
          type="button"
          role="tab"
          aria-selected={activeTab === 'batch'}
          aria-controls="intake-batch-panel"
          onClick={() => setActiveTab('batch')}
        >
          Tercatat ({visibleCount})
        </button>
      </div>

      <div className="admin-intake-workspace">
        <section
          className={`admin-panel intake-daily-panel${activeTab === 'daily' ? ' is-mobile-active' : ''}`}
          id="intake-daily-panel"
          role="tabpanel"
          aria-labelledby="intake-daily-tab"
        >
          <div className="admin-panel-heading">
            <div>
              <h2>Intake Harian Satpam</h2>
            </div>
          </div>
          <p className="intake-info-banner">
            Input dari laporan WhatsApp Satpam hari ini.
          </p>
          <form className="admin-form intake-form" onSubmit={addIntake}>
            <label className="admin-field" htmlFor="intake-name">
              Nama barang
              <input
                id="intake-name"
                name="name"
                type="text"
                placeholder="Contoh: Kunci motor Honda"
                required
              />
            </label>
            <div className="admin-form-row intake-location-row">
              <label className="admin-field" htmlFor="intake-location">
                Lokasi ditemukan
                <input
                  id="intake-location"
                  name="location"
                  type="text"
                  placeholder="Contoh: Parkiran B"
                  required
                />
              </label>
              <label className="admin-field" htmlFor="intake-time">
                Diterima Satpam (jam)
                <input id="intake-time" name="time" type="time" required />
              </label>
            </div>
            <fieldset className="intake-category-field">
              <legend>Kategori</legend>
              <div className="intake-category-options">
                {['Umum', 'Sensitif'].map((option) => (
                  <label
                    className={`intake-category-option${category === option ? ' is-selected' : ''}`}
                    key={option}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={option}
                      checked={category === option}
                      onChange={() => setCategory(option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="intake-photo-field">
              <label className="admin-field" htmlFor="intake-photo">
                Foto barang (opsional, JPG / PNG, maks {MAX_PHOTO_SIZE_MB} MB)
              </label>
              <label className="intake-upload-box" htmlFor="intake-photo">
                <span className="intake-upload-action">+ Unggah foto</span>
                <span>{photoName || 'Pilih foto barang'}</span>
                <input
                  id="intake-photo"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handlePhotoChange}
                />
              </label>
              {photoError && (
                <span className="auth-field-error" role="alert">
                  {photoError}
                </span>
              )}
            </div>
            <p className="intake-status-note">
              Status awal: Tersedia setelah laporan diterima Admin BEM.
            </p>
            <Button className="intake-submit-button" type="submit">
              Simpan &amp; Tampilkan di Katalog
            </Button>
          </form>
          <p className="admin-data-note">
            Form ini menyimpan perubahan dalam preview halaman; integrasi
            katalog dan penyimpanan memerlukan backend.
          </p>
        </section>

        <section
          className={`admin-panel intake-batch-panel${activeTab === 'batch' ? ' is-mobile-active' : ''}`}
          id="intake-batch-panel"
          role="tabpanel"
          aria-labelledby="intake-batch-tab"
        >
          <div className="admin-panel-heading">
            <div>
              <h2>Batch Mingguan</h2>
              <p>{visibleCount} barang tercatat</p>
            </div>
          </div>
          {items.length ? (
            <ul className="intake-item-list">
              {items.map((item) => (
                <li className="intake-item" key={item.id}>
                  <div className="intake-item-details">
                    <strong>{item.name}</strong>
                    <span>
                      {item.location}, {item.date} {item.time}
                    </span>
                  </div>
                  <span
                    className={`intake-category-badge${item.category === 'Sensitif' ? ' is-sensitive' : ''}`}
                  >
                    {item.category}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="admin-empty-note">
              Belum ada barang yang tercatat.
            </p>
          )}
          <p className="intake-helper-text">
            Barang temuan dapat diklaim setelah laporan diterima Admin BEM.
          </p>
        </section>
      </div>
    </div>
  );
}
