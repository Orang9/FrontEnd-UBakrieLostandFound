import { X } from 'lucide-react';

export function Dialog({ title, children, onClose }) {
  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <section
        className="dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="dialog-header">
          <h2>{title}</h2>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog"
          >
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
