import { useCallback, useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button.jsx';
import { getAdminClaims, reviewClaim } from '../api/claimApi.js';

export function ReviewClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const loadClaims = useCallback(async () => {
    setError('');
    try {
      const response = await getAdminClaims({ status: 'all' });
      setClaims(response.data ?? []);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Daftar klaim gagal dimuat.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  async function decide(claim, status) {
    setProcessingId(claim.claim_id);
    setError('');
    try {
      await reviewClaim(claim.claim_id, { status });
      await loadClaims();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Keputusan klaim gagal disimpan.',
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <section className="admin-page">
      <h1>Tinjau Klaim</h1>
      <p>Periksa bukti kepemilikan sebelum memverifikasi atau menolak klaim.</p>
      {error && <p role="alert">{error}</p>}
      {loading ? (
        <p role="status">Memuat klaim...</p>
      ) : claims.length ? (
        <div className="admin-claim-list">
          {claims.map((claim) => (
            <article className="feature-placeholder" key={claim.claim_id}>
              <h2>{claim.item_name}</h2>
              <p>
                Klaim #{claim.claim_id} · {claim.claimer_name} (
                {claim.claimer_nim})
              </p>
              <p>{claim.challange_answer || 'Tidak ada jawaban tambahan.'}</p>
              <p>Status: {claim.status}</p>
              {claim.status === 'pending' && (
                <div className="claim-review-actions">
                  <Button
                    type="button"
                    disabled={processingId === claim.claim_id}
                    onClick={() => decide(claim, 'verified')}
                  >
                    Setujui
                  </Button>
                  <Button
                    type="button"
                    disabled={processingId === claim.claim_id}
                    onClick={() => decide(claim, 'rejected')}
                  >
                    Tolak
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p>Tidak ada klaim.</p>
      )}
    </section>
  );
}
