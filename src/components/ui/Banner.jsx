export function Banner({ children, variant = 'info', role = 'status' }) {
  return (
    <div className={`banner banner-${variant}`} role={role}>
      {children}
    </div>
  );
}
