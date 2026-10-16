import { useEffect, useState } from 'react';
import { getSlots } from '../api/schedulingApi.js';

export function AdminSchedulingPage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    getSlots()
      .then((response) => {
        if (isCurrent) setSlots(response.data ?? []);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(
            requestError.response?.data?.message || 'Daftar slot gagal dimuat.',
          );
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <section className="admin-page">
      <h1>Slot Pengambilan</h1>
      <p>
        Jadwal operasional yang saat ini dikonfigurasi di backend. API belum
        menyediakan operasi untuk menambah, mengubah, atau menonaktifkan slot.
      </p>
      {error && <p role="alert">{error}</p>}
      {loading ? (
        <p role="status">Memuat slot...</p>
      ) : slots.length ? (
        <div className="admin-slot-list">
          {slots.map((slot) => (
            <article className="feature-placeholder" key={slot.slot_id}>
              <h2>{slot.day_of_week}</h2>
              <p>
                {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
              </p>
              <p>{slot.location}</p>
              <p>Kuota maksimum: {slot.max_quota}</p>
            </article>
          ))}
        </div>
      ) : (
        <p>Tidak ada slot pengambilan aktif.</p>
      )}
    </section>
  );
}
