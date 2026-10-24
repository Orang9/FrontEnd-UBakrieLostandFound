import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ToastProvider } from '../../src/app/providers/ToastProvider.jsx';
import { ClaimPage } from '../../src/features/claim/index.js';
import { ProfilePage } from '../../src/features/profile/index.js';

vi.mock(
  '../../src/features/catalog/api/catalogApi.js',
  async (importOriginal) => {
    const actual = await importOriginal();
    return { ...actual, getCatalogItem: vi.fn() };
  },
);
vi.mock('../../src/features/claim/api/claimApi.js', () => ({
  createClaim: vi.fn(),
}));
vi.mock('../../src/features/profile/api/profileApi.js', () => ({
  getProfile: vi.fn(),
}));

import { getCatalogItem } from '../../src/features/catalog/api/catalogApi.js';
import { createClaim } from '../../src/features/claim/api/claimApi.js';
import { getProfile } from '../../src/features/profile/api/profileApi.js';

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  getCatalogItem.mockResolvedValue({
    item_id: 'dompet-kartu-identitas',
    name: 'Dompet / kartu identitas',
    image_path: 'public/uploads/dompet.jpg',
    report_type: 'found',
    status: 'available',
    category_name: 'Sensitif',
    location: 'Kantin',
    report_date: '2026-10-21',
    claim_questions: [
      'Sebutkan isi dompet selain kartu identitas',
      'Warna / ciri khusus dompet',
    ],
  });
  createClaim.mockResolvedValue({
    status: 'success',
    data: { claim_id: 147, status: 'pending' },
  });
  getProfile.mockResolvedValue({
    data: {
      claims: [
        {
          claim_id: 147,
          status: 'pending',
          item_name: 'Dompet / kartu identitas',
          item: {
            id: 'dompet-kartu-identitas',
            name: 'Dompet / kartu identitas',
            category: 'Sensitif',
            icon: 'wallet',
          },
          detailed: true,
          steps: [
            {
              key: 'PENDING',
              label: 'Menunggu persetujuan Admin BEM (PENDING)',
              time: 'Menunggu persetujuan',
              complete: false,
            },
          ],
        },
      ],
      reports: [],
    },
  });
});
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
  it('shows an item-specific verification form', async () => {
    renderClaimFlow();

    expect(
      await screen.findByRole('heading', { name: 'Ajukan Klaim' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Dompet / kartu identitas' }),
    ).toBeInTheDocument();
    expect(document.querySelector('.claim-item-thumbnail img')).toHaveAttribute(
      'src',
      'http://localhost:5001/uploads/dompet.jpg',
    );
    expect(
      screen.getByText('1. Sebutkan isi dompet selain kartu identitas'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Status setelah dikirim: PENDING'),
    ).toBeInTheDocument();
  });

  it('renders and submits the configured number of verification questions', async () => {
    getCatalogItem.mockResolvedValueOnce({
      item_id: 'item-with-three-prompts',
      name: 'Tas ransel',
      report_type: 'found',
      status: 'available',
      category_name: 'Umum',
      location: 'Aula',
      report_date: '2026-10-21',
      claim_questions: [
        'Pertanyaan satu?',
        'Pertanyaan dua?',
        'Pertanyaan tiga?',
      ],
    });
    renderClaimFlow('item-with-three-prompts');

    expect(
      await screen.findByText(
        'Jawab 3 pertanyaan kunci. Admin BEM akan meninjau jawaban secara manual sebelum klaim disetujui.',
      ),
    ).toBeInTheDocument();
    const questions = [
      'Pertanyaan satu?',
      'Pertanyaan dua?',
      'Pertanyaan tiga?',
    ];
    questions.forEach((question, index) => {
      fireEvent.change(screen.getByLabelText(`${index + 1}. ${question}`), {
        target: { value: `Jawaban ${index + 1}` },
      });
    });
    fireEvent.click(screen.getByRole('button', { name: 'Kirim Klaim' }));

    expect(
      await screen.findByRole('heading', { name: 'Riwayat Saya' }),
    ).toBeInTheDocument();
    expect(createClaim).toHaveBeenCalledOnce();
    expect(JSON.parse(createClaim.mock.calls[0][1].get('answers'))).toEqual([
      'Jawaban 1',
      'Jawaban 2',
      'Jawaban 3',
    ]);
  });

  it('submits despite malformed local preview history and uses the backend claim', async () => {
    localStorage.setItem(
      'ubakrie-lf-preview-claims',
      JSON.stringify([{ id: 147, status: 'pending' }]),
    );
    renderClaimFlow();

    fireEvent.change(
      await screen.findByLabelText(
        '1. Sebutkan isi dompet selain kartu identitas',
      ),
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
    expect(createClaim).toHaveBeenCalledOnce();
  });
});
