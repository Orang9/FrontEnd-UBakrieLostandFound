import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../../src/app/providers/ToastProvider.jsx';
import { ClaimPage } from '../../src/features/claim/index.js';
import { ProfilePage } from '../../src/features/profile/index.js';

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  localStorage.clear();
});

function renderClaimFlow(itemId = 'dompet-kartu-identitas') {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[`/catalog/${itemId}`]}>
        <Routes>
          <Route path="/catalog/:itemId" element={<ClaimPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('ClaimPage', () => {
  it('shows an item-specific verification form without login', () => {
    renderClaimFlow();

    expect(
      screen.getByRole('heading', { name: 'Ajukan Klaim' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Dompet / kartu identitas' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('1. Sebutkan isi dompet selain kartu identitas'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Status setelah dikirim: PENDING'),
    ).toBeInTheDocument();
  });

  it('stores a pending claim locally and navigates to profile history', async () => {
    renderClaimFlow();

    fireEvent.change(
      screen.getByLabelText('1. Sebutkan isi dompet selain kartu identitas'),
      { target: { value: 'Kartu ATM dan struk' } },
    );
    fireEvent.change(screen.getByLabelText('2. Warna / ciri khusus dompet'), {
      target: { value: 'Hitam dengan gantungan kunci kecil' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Kirim Klaim' }));

    expect(
      await screen.findByRole('heading', { name: 'Riwayat Saya' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/berstatus PENDING\. Tunggu persetujuan Admin BEM/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Menunggu persetujuan Admin BEM \(PENDING\)/),
    ).toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem('ubakrie-lf-preview-claims')),
    ).toHaveLength(1);
  });
});
