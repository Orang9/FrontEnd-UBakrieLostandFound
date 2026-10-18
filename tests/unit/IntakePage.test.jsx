import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../src/app/providers/ToastProvider.jsx';
import { IntakePage } from '../../src/features/intake/index.js';

afterEach(cleanup);

function renderIntakePage() {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <IntakePage />
      </ToastProvider>
    </MemoryRouter>,
  );
}

describe('IntakePage', () => {
  it('shows the intake form and weekly batch from the design specification', () => {
    renderIntakePage();

    expect(
      screen.getByRole('heading', { name: 'Intake Satpam' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Intake Harian Satpam' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Kartu ATM')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Pindahkan ke Lemari Kaca' }),
    ).toBeEnabled();
  });

  it('adds a daily intake to the local batch preview', async () => {
    renderIntakePage();

    fireEvent.change(screen.getByLabelText('Nama barang'), {
      target: { value: 'Botol minum' },
    });
    fireEvent.change(screen.getByLabelText('Lokasi ditemukan'), {
      target: { value: 'Perpustakaan' },
    });
    fireEvent.change(screen.getByLabelText('Diterima Satpam (jam)'), {
      target: { value: '09:30' },
    });
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Simpan & Tampilkan di Katalog',
      }),
    );

    expect(await screen.findByText('Botol minum')).toBeInTheDocument();
    expect(
      screen.getByText('6 barang menunggu di Pos Satpam'),
    ).toBeInTheDocument();
  });

  it('moves only selected items out of the weekly batch preview', () => {
    renderIntakePage();

    for (const name of [
      'Payung biru',
      'Jaket hitam',
      'Kartu ATM',
      'Flashdisk biru',
    ]) {
      fireEvent.click(screen.getByRole('checkbox', { name: `Pilih ${name}` }));
    }
    fireEvent.click(
      screen.getByRole('button', { name: 'Pindahkan ke Lemari Kaca' }),
    );

    expect(screen.queryByText('Kunci motor Honda')).not.toBeInTheDocument();
    expect(screen.getByText('Payung biru')).toBeInTheDocument();
    expect(
      screen.getByText('4 barang menunggu di Pos Satpam'),
    ).toBeInTheDocument();
  });

  it('switches to the batch list tab on mobile layouts', () => {
    renderIntakePage();

    fireEvent.click(screen.getByRole('tab', { name: 'Batch Satpam (5)' }));

    expect(
      screen.getByRole('tab', { name: 'Batch Satpam (5)' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      screen.getByRole('tabpanel', { name: 'Batch Satpam (5)' }),
    ).toBeInTheDocument();
  });
});
