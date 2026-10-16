import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ProfilePage } from '../../src/features/profile/index.js';

afterEach(cleanup);

describe('ProfilePage', () => {
  it('shows claim history and the claim progress timeline by default', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Riwayat Saya' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Riwayat Klaim' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByRole('heading', { name: 'Dompet / kartu identitas' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Verifikasi manual Admin BEM')).toBeInTheDocument();
    expect(screen.getByText('Klaim #CL-0147')).toBeInTheDocument();
  });

  it('switches to report history', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('tab', { name: 'Riwayat Lapor' }));

    expect(screen.getByRole('tab', { name: 'Riwayat Lapor' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Laporan #RP-0108')).toBeInTheDocument();
    expect(screen.getByText('Temuan')).toBeInTheDocument();
    expect(screen.queryByText('Klaim #CL-0147')).not.toBeInTheDocument();
  });
});
