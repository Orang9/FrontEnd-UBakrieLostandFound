import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../../src/app/providers/AuthProvider.jsx';
import { HomePage } from '../../src/features/home/index.js';

describe('HomePage', () => {
  it('presents the lost and found entry point', () => {
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
    expect(screen.getByText('Halo, Najwa')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Panduan Penggunaan' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(7);
    expect(screen.getByRole('link', { name: /Lapor Hilang/ })).toHaveAttribute(
      'href',
      '/report?type=lost',
    );
    expect(screen.getByRole('link', { name: /Lapor Temuan/ })).toHaveAttribute(
      'href',
      '/report?type=found',
    );
    expect(screen.getByText('Lemari Kaca BEM')).toBeInTheDocument();
    expect(
      screen.getByText(/memerlukan verifikasi manual/),
    ).toBeInTheDocument();
  });
});
