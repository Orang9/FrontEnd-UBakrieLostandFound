import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../../src/app/providers/ToastProvider.jsx';
import { ManageItemsPage } from '../../src/features/items/index.js';

vi.mock('../../src/features/admin/api/adminApi.js', () => ({
  getAdminItems: vi.fn(),
  approveAdminItem: vi.fn(),
  configureAdminItemVerificationQuestions: vi.fn(),
  rejectAdminItem: vi.fn(),
  restoreAdminItem: vi.fn(),
}));

import {
  approveAdminItem,
  configureAdminItemVerificationQuestions,
  getAdminItems,
  rejectAdminItem,
  restoreAdminItem,
} from '../../src/features/admin/api/adminApi.js';

const reports = [
  {
    item_id: 11,
    report_type: 'found',
    report_review_status: 'pending',
    name: 'Tas ransel hitam',
    category_name: 'Tas',
    found_location: 'Aula',
    found_date: '2026-10-12',
    claim_questions: [],
    claim_question_count: 0,
  },
  {
    item_id: 12,
    report_type: 'lost',
    report_review_status: 'pending',
    name: 'Payung biru',
    category_name: 'Umum',
    lost_location: 'Aula',
    lost_date: '2026-10-11',
  },
  {
    item_id: 13,
    report_type: 'found',
    report_review_status: 'accepted',
    status: 'available',
    name: 'Dompet hitam',
    category_name: 'Dompet',
    found_location: 'Perpustakaan',
    found_date: '2026-10-10',
    claim_questions: [],
    claim_question_count: 0,
  },
];

function renderManageItems() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <ManageItemsPage />
      </ToastProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  getAdminItems.mockResolvedValue({ data: reports });
  approveAdminItem.mockResolvedValue({ status: 'success' });
  configureAdminItemVerificationQuestions.mockResolvedValue({ status: 'success' });
  rejectAdminItem.mockResolvedValue({ status: 'success' });
  restoreAdminItem.mockResolvedValue({ status: 'success' });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('ManageItemsPage verification questions', () => {
  it('requires questions before accepting found reports', async () => {
    renderManageItems();
    const report = (await screen.findByRole('heading', { name: 'Tas ransel hitam' }))
      .closest('article');

    fireEvent.click(within(report).getByRole('button', { name: 'Terima & Catat' }));

    expect(approveAdminItem).not.toHaveBeenCalled();
    expect(
      within(report).getByRole('heading', { name: 'Pertanyaan verifikasi kepemilikan' }),
    ).toBeInTheDocument();
    expect(within(report).getByLabelText('Pertanyaan 1')).toBeRequired();

    fireEvent.change(within(report).getByLabelText('Pertanyaan 1'), {
      target: { value: 'Apa ciri khusus barang ini?' },
    });
    fireEvent.click(within(report).getByRole('button', { name: 'Simpan & Terima' }));

    expect(approveAdminItem).toHaveBeenCalledWith(11, ['Apa ciri khusus barang ini?']);
  });

  it('allows Admin BEM to configure verification questions for legacy accepted items', async () => {
    renderManageItems();
    fireEvent.click(await screen.findByRole('tab', { name: 'Diterima 1' }));
    const report = (await screen.findByRole('heading', { name: 'Dompet hitam' }))
      .closest('article');

    fireEvent.click(within(report).getByRole('button', { name: 'Atur Pertanyaan Klaim' }));
    fireEvent.change(within(report).getByLabelText('Pertanyaan 1'), {
      target: { value: 'Sebutkan isi dompet.' },
    });
    fireEvent.click(within(report).getByRole('button', { name: 'Simpan Pertanyaan' }));

    expect(configureAdminItemVerificationQuestions).toHaveBeenCalledWith(
      13,
      ['Sebutkan isi dompet.'],
    );
  });

  it('allows found reports to have no more than ten questions', async () => {
    renderManageItems();
    const report = (await screen.findByRole('heading', { name: 'Tas ransel hitam' }))
      .closest('article');
    fireEvent.click(within(report).getByRole('button', { name: 'Terima & Catat' }));

    for (let count = 1; count < 10; count += 1) {
      fireEvent.click(within(report).getByRole('button', { name: 'Tambah Pertanyaan' }));
    }

    expect(within(report).getAllByLabelText(/^Pertanyaan \d+$/)).toHaveLength(10);
    expect(
      within(report).getByRole('button', { name: 'Tambah Pertanyaan' }),
    ).toBeDisabled();
  });

  it('accepts lost reports without verification questions', async () => {
    renderManageItems();
    const report = (await screen.findByRole('heading', { name: 'Payung biru' }))
      .closest('article');
    fireEvent.click(within(report).getByRole('button', { name: 'Terima & Catat' }));

    expect(approveAdminItem).toHaveBeenCalledWith(12);
    expect(
      within(report).queryByRole('heading', { name: 'Pertanyaan verifikasi kepemilikan' }),
    ).not.toBeInTheDocument();
  });
});
