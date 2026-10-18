import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { AuthProvider } from '../../src/app/providers/AuthProvider.jsx';
import { AdminLayout } from '../../src/layouts/AdminLayout.jsx';

afterEach(cleanup);

describe('AdminLayout', () => {
  it('uses the hamburger drawer as the only navigation and keeps the logo in the topbar', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthProvider>
          <AdminLayout />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Admin BEM')).toBeInTheDocument();
    expect(
      screen.queryByText('Lost & Found Admin BEM'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('.admin-mobile-nav'),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Buka menu admin' }));

    expect(container.querySelector('.admin-menu-toggle')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(
      screen.getByRole('link', { name: 'Intake Satpam' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Audit Trail' }),
    ).toBeInTheDocument();
  });
});
