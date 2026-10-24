import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../../src/app/providers/ToastProvider.jsx';
import { ReviewClaimsPage } from '../../src/features/claim/pages/ReviewClaimsPage.jsx';

vi.mock('../../src/features/admin/api/adminApi.js', () => ({
  getAdminClaims: vi.fn(),
  processAdminClaim: vi.fn(),
}));

import { getAdminClaims } from '../../src/features/admin/api/adminApi.js';

beforeEach(() => {
  getAdminClaims.mockResolvedValue({
    data: [
      {
        claim_id: 41,
        item_name: 'Tas ransel',
        claimer_name: 'Mahasiswa',
        is_sensitive: 0,
        status: 'pending',
        verification_answers: [
          {
            question: 'Apa ciri khusus tas ini?',
            answer: 'Ada gantungan kunci berbentuk bintang.',
          },
        ],
      },
    ],
  });
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

    expect(await screen.findByText(/Apa ciri khusus tas ini\?/)).toBeInTheDocument();
    expect(screen.getByText('Ada gantungan kunci berbentuk bintang.')).toBeInTheDocument();
  });
});
