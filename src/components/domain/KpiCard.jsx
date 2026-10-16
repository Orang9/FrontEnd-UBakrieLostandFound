export function KpiCard({ label, value, detail }) {
  return (
    <article className="kpi-card">
      <p>{label}</p>
      <strong>{value}</strong>
      {detail && <span>{detail}</span>}
    </article>
  );
}
