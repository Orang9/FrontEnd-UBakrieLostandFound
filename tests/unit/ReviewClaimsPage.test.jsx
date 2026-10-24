import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../../src/app/providers/ToastProvider.jsx';
import { ReviewClaimsPage } from '../../src/features/claim/pages/ReviewClaimsPage.jsx';

vi.mock('../../src/features/admin/api/adminApi.js', () => ({
  getAdminClaims: vi.fn(),
  getClaimEvidence: vi.fn(),
  processAdminClaim: vi.fn(),
}));

import {
  getAdminClaims,
  getClaimEvidence,
} from '../../src/features/admin/api/adminApi.js';

beforeEach(() => {
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => 'blob:claim-evidence'),
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: vi.fn(),
  });
  getAdminClaims.mockResolvedValue({
    data: [
      {
        claim_id: 41,
        item_name: 'Tas ransel',
        image_path: 'public/uploads/tas.jpg',
        claimer_name: 'Mahasiswa',
        is_sensitive: 0,
        status: 'pending',
        has_evidence: true,
        evidence_url: '/api/claims/41/evidence',
        verification_answers: [
          {
            question: 'Apa ciri khusus tas ini?',
            answer: 'Ada gantungan kunci berbentuk bintang.',
          },
        ],
      },
    ],
  });
  getClaimEvidence.mockResolvedValue(
    new Blob(['image'], { type: 'image/png' }),
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('ReviewClaimsPage', () => {
  it('shows the saved verification question and its matching answer', async () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <ReviewClaimsPage />
        </ToastProvider>
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/Apa ciri khusus tas ini\?/),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Ada gantungan kunci berbentuk bintang.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Foto Tas ransel' }),
    ).toHaveAttribute('src', 'http://localhost:5001/uploads/tas.jpg');
    expect(
      await screen.findByRole('img', { name: 'Bukti kepemilikan klaim 41' }),
    ).toHaveAttribute('src', 'blob:claim-evidence');
    expect(getClaimEvidence).toHaveBeenCalledWith(41);
  });
});
