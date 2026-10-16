import { STATUS_LABELS, STATUS_TONES } from '../../constants/status.js';

export function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] ?? status;
  const tone = STATUS_TONES[status] ?? 'neutral';
  return <span className={`status-badge status-${tone}`}>{label}</span>;
}
