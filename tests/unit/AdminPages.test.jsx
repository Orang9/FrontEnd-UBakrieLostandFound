import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../src/app/providers/ToastProvider.jsx';
import { AuditPage } from '../../src/features/audit/index.js';
import { DashboardPage } from '../../src/features/dashboard/index.js';
import { ReviewClaimsPage } from '../../src/features/claim/index.js';
import { AdminSchedulingPage } from '../../src/features/scheduling/index.js';

afterEach(cleanup);

function renderAdminPage(page) {
  return render(
    <MemoryRouter>
      <ToastProvider>{page}</ToastProvider>
    </MemoryRouter>,
  );
}

describe('Admin pages', () => {
  it('shows the dashboard metrics and monthly report chart', () => {
    renderAdminPage(<DashboardPage />);

    expect(
      screen.getByRole('heading', { name: 'Dashboard Monitoring' }),
    ).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: 'Grafik batang laporan dan klaim per bulan',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Data contoh')).toBeInTheDocument();
  });

  it('requires manual verification before approving sensitive claims', () => {
    renderAdminPage(<ReviewClaimsPage />);

    const approveButton = screen.getByRole('button', { name: 'Setujui' });
    expect(approveButton).toBeDisabled();

    fireEvent.click(
      screen.getByRole('checkbox', {
        name: /Verifikasi manual selesai/,
      }),
    );
    expect(approveButton).toBeEnabled();
  });

  it('switches between slot list and add-slot form', () => {
    renderAdminPage(<AdminSchedulingPage />);

    expect(screen.getAllByText('09.00 - 10.00').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('tab', { name: '+ Tambah Slot' }));
    expect(
      screen.getByRole('heading', { name: 'Tambah Slot' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Senin - Jumat, 09.00 - 15.00 WIB'),
    ).toBeInTheDocument();
  });

  it('filters audit events by actor', () => {
    renderAdminPage(<AuditPage />);

    fireEvent.change(screen.getByLabelText('Aktor (actor_id)'), {
      target: { value: 'security-desk' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Terapkan' }));

    expect(screen.getByText('security-desk')).toBeInTheDocument();
    expect(screen.queryByText('admin-bem')).not.toBeInTheDocument();
    expect(screen.getByText('1 peristiwa ditemukan')).toBeInTheDocument();
  });
});
