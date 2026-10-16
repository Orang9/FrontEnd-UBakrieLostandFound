import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../src/app/providers/AuthProvider.jsx';
import { HomePage } from '../../src/features/home/index.js';

describe('HomePage', () => {
  it('presents the supported found-item reporting entry point', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <HomePage />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(
      screen.getByRole('heading', { name: 'Beranda' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Halo, Pengguna')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Panduan Penggunaan' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(7);
    expect(
      screen.queryByRole('link', { name: /Lapor Hilang/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Laporkan Barang Temuan/ }),
    ).toHaveAttribute('href', '/report');
    expect(screen.getByText('Lemari Kaca BEM')).toBeInTheDocument();
    expect(
      screen.getByText(/memerlukan verifikasi manual/),
    ).toBeInTheDocument();
  });
});
