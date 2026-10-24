import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { paths } from '../../../app/router/paths.js';
import { getProfile } from '../../profile/api/profileApi.js';
import { getSlots, createSchedule } from '../api/schedulingApi.js';
import { formatShortDate } from '../../../lib/format.js';

export function SchedulingPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const claimId = params.get('claimId');
  const [claim, setClaim] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [slotId, setSlotId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    setLoading(true);
    Promise.all([getProfile(), getSlots({ date })]).then(([profile, result]) => {
      const data = profile?.data ?? profile;
      setClaim((data.claims ?? []).find((item) => String(item.id ?? item.claim_id) === claimId));
      const values = result?.slots ?? result?.data?.slots ?? result?.data ?? [];
      setSlots(values.map((item) => ({ ...item, id: item.id ?? item.slot_id, label: item.label ?? `${String(item.start_time).slice(0, 5)} - ${String(item.end_time).slice(0, 5)}`, available: item.available ?? Number(item.available_quota) > 0 })));
    }).catch(() => setError('Jadwal tidak dapat dimuat.')).finally(() => setLoading(false));
  }, [claimId, date]);
  const selected = slots.find((item) => String(item.id) === String(slotId));
  const canSchedule = ['APPROVED', 'VERIFIED'].includes(String(claim?.status ?? '').toUpperCase());
  async function submit(event) {
    event.preventDefault();
    if (!canSchedule || !selected?.available) return;
    try { await createSchedule({ claim_id: claimId, slot_id: selected.id, scheduled_date: date }); navigate(`${paths.profile}?tab=claims&claimId=${encodeURIComponent(claimId)}&scheduled=1`); }
    catch { setError('Jadwal tidak dapat disimpan.'); }
  }
  return <main className="scheduling-page">
    <header className="scheduling-header"><Link className="scheduling-back" to={paths.profile} aria-label="Kembali ke profil"><ArrowLeft size={22} /></Link><h1>Pilih Slot Pengambilan</h1></header>
    {loading ? <p role="status">Memuat jadwal...</p> : error && !claim ? <p role="alert">{error}</p> : !canSchedule ? <section className="scheduling-unavailable" role="status"><p>{claim ? 'Jadwal hanya dapat dipilih setelah klaim disetujui.' : 'Klaim yang disetujui tidak ditemukan.'}</p><Link to={`${paths.profile}?tab=claims`}>Kembali ke profil</Link></section> : <form className="scheduling-content" onSubmit={submit}>
      <div className="scheduling-approval" role="status">Klaim disetujui. Pilih jadwal pengambilan.</div>
      <section className="scheduling-section"><h2>Pilih tanggal</h2><label className="scheduling-date is-selected"><input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /><strong>{formatShortDate(date)}</strong></label></section>
      <section className="scheduling-section"><h2>Slot tersedia - {formatShortDate(date)}</h2><div className="scheduling-slot-list" role="radiogroup" aria-label="Pilih slot waktu">{slots.map((item) => <label className={`scheduling-slot${String(slotId) === String(item.id) ? ' is-selected' : ''}${item.available ? '' : ' is-full'}`} key={item.id}><input type="radio" name="schedule-slot" value={item.id} checked={String(slotId) === String(item.id)} disabled={!item.available} onChange={() => setSlotId(item.id)} /><strong>{item.label}</strong>{!item.available && <span className="scheduling-full-badge">Penuh</span>}</label>)}</div></section>
      <button className="scheduling-confirm" type="submit" disabled={!selected?.available}>Konfirmasi Jadwal</button>{error && <p role="alert">{error}</p>}
    </form>}
  </main>;
}
