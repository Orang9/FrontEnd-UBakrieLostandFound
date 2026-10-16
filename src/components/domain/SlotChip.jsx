export function SlotChip({
  label,
  selected = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      className={`slot-chip${selected ? ' is-selected' : ''}`}
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      {...props}
    >
      {label}
    </button>
  );
}
