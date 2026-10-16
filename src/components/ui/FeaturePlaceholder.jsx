export function FeaturePlaceholder({ title, description }) {
  return (
    <section className="feature-placeholder">
      <p className="eyebrow">UBakrie Lost &amp; Found</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <p className="placeholder-note">
        Kerangka layar siap. Detail UI dan integrasi menunggu spesifikasi layar
        serta kontrak API.
      </p>
    </section>
  );
}
