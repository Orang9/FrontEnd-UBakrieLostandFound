import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../../src/app/providers/ToastProvider.jsx';
import { ClaimPage } from '../../src/features/claim/index.js';
import { ProfilePage } from '../../src/features/profile/index.js';
import {
  createClaim,
  getMyClaims,
} from '../../src/features/claim/api/claimApi.js';
import { getCatalogItem } from '../../src/features/catalog/api/catalogApi.js';
import { getProfile } from '../../src/features/profile/api/profileApi.js';

vi.mock('../../src/features/claim/api/claimApi.js', () => ({
  createClaim: vi.fn(),
  getMyClaims: vi.fn(),
}));
vi.mock('../../src/features/catalog/api/catalogApi.js', () => ({
  getCatalogItem: vi.fn(),
  getCatalog: vi.fn(),
  getCategories: vi.fn(),
}));
vi.mock('../../src/features/profile/api/profileApi.js', () => ({
  getProfile: vi.fn(),
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
});

beforeEach(() => {
  getCatalogItem.mockResolvedValue({
    data: {
      item_id: 7,
      name: 'Dompet kulit',
      category_name: 'Dompet',
      is_sensitive: 1,
      found_location: 'Kantin',
      found_date: '2026-10-10',
      status: 'secured',
    },
  });
  getMyClaims.mockResolvedValue({ data: [] });
  createClaim.mockResolvedValue({
    message: 'Claim submitted successfully.',
    data: { claim_id: 21 },
  });
  getProfile.mockResolvedValue({
    data: [
      {
        claim_id: 21,
        item_name: 'Dompet kulit',
        category_name: 'Dompet',
        status: 'pending',
      },
    ],
  });
});

function renderClaimFlow(itemId = '7') {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[`/items/${itemId}/claim`]}>
        <Routes>
          <Route path="/items/:itemId/claim" element={<ClaimPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('ClaimPage', () => {
  it('loads an item and marks the challenge answer required for sensitive items', async () => {
    renderClaimFlow();

    expect(
      await screen.findByRole('heading', { name: 'Dompet kulit' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Jelaskan ciri khusus barang yang ingin Anda klaim.'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Kirim Klaim' }));
    expect(
      await screen.findByText('Jawaban wajib diisi untuk barang sensitif.'),
    ).toBeInTheDocument();
  });

  it('submits the documented claim request and shows backend claim history', async () => {
    renderClaimFlow();
    fireEvent.change(
      await screen.findByLabelText(
        'Jelaskan ciri khusus barang yang ingin Anda klaim.',
      ),
      { target: { value: 'Ada gantungan kunci biru di dalamnya.' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Kirim Klaim' }));

    await waitFor(() =>
      expect(createClaim).toHaveBeenCalledWith({
        item_id: 7,
        challange_answer: '1. Ada gantungan kunci biru di dalamnya.',
      }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Riwayat Saya' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Klaim #21')).toBeInTheDocument();
    expect(localStorage.getItem('ubakrie-lf-preview-claims')).toBeNull();
  });
});
