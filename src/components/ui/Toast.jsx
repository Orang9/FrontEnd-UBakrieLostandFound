import { useEffect } from 'react';
import { X } from 'lucide-react';

export function Toast({ message, variant, onDismiss }) {
  useEffect(() => {
    const timeout = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timeout);
  }, [onDismiss]);

  return (
    <div className={`toast toast-${variant}`} role="status">
      <span>{message}</span>
      <button
        className="icon-button"
        type="button"
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
      >
        <X size={18} />
      </button>
    </div>
  );
}
