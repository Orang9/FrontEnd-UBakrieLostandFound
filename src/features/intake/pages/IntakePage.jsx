import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button.jsx';
import { getCategories } from '../../catalog/api/catalogApi.js';
import { recordIntake } from '../api/intakeApi.js';

export function IntakePage() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    getCategories()
      .then((response) => setCategories(response.data ?? []))
      .catch((requestError) => {
        setError(
          requestError.response?.data?.message ||
            'Kategori barang gagal dimuat.',
        );
      });
  }, []);

  async function onSubmit(values) {
    const formData = new FormData();
    formData.append('name', values.name.trim());
    formData.append('description', values.description.trim());
    formData.append('found_location', values.location.trim());
    formData.append('category_id', values.category_id);
    formData.append('found_date', values.found_date);
    formData.append('image', values.image[0]);
    setSubmitting(true);
    setError('');
    try {
      await recordIntake(formData);
      reset();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Penerimaan barang gagal dicatat.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="admin-page">
      <h1>Penerimaan Barang</h1>
      <p>
        Barang yang dimasukkan oleh petugas langsung ditandai tersedia di lemari
        dan pemberitahuan dikirim ke mahasiswa.
      </p>
      {error && <p role="alert">{error}</p>}
      <form className="report-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="report-field">
          Nama barang
          <input
            {...register('name', { required: 'Nama barang wajib diisi.' })}
          />
          {errors.name && <span role="alert">{errors.name.message}</span>}
        </label>
        <label className="report-field">
          Kategori
          <select
            defaultValue=""
            {...register('category_id', { required: 'Pilih kategori barang.' })}
          >
            <option value="">Pilih kategori</option>
            {categories.map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <span role="alert">{errors.category_id.message}</span>
          )}
        </label>
        <label className="report-field">
          Lokasi diterima
          <input
            {...register('location', { required: 'Lokasi wajib diisi.' })}
          />
          {errors.location && (
            <span role="alert">{errors.location.message}</span>
          )}
        </label>
        <label className="report-field">
          Tanggal ditemukan
          <input
            type="date"
            {...register('found_date', { required: 'Tanggal wajib diisi.' })}
          />
          {errors.found_date && (
            <span role="alert">{errors.found_date.message}</span>
          )}
        </label>
        <label className="report-field">
          Deskripsi
          <textarea
            rows={3}
            {...register('description', {
              required: 'Deskripsi wajib diisi.',
            })}
          />
          {errors.description && (
            <span role="alert">{errors.description.message}</span>
          )}
        </label>
        <label className="report-field">
          Foto barang
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            {...register('image', { required: 'Foto barang wajib diunggah.' })}
          />
          {errors.image && <span role="alert">{errors.image.message}</span>}
        </label>
        <Button type="submit" disabled={submitting || categories.length === 0}>
          {submitting ? 'Menyimpan...' : 'Catat dan amankan barang'}
        </Button>
      </form>
    </section>
  );
}
