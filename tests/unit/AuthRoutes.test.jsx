import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { AuthProvider } from '../../src/app/providers/AuthProvider.jsx';
import { ProtectedRoute } from '../../src/app/router/ProtectedRoute.jsx';
import { RoleRoute } from '../../src/app/router/RoleRoute.jsx';
import { UserLayout } from '../../src/layouts/UserLayout.jsx';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

function renderProtectedPath(path, session) {
  if (session) {
    localStorage.setItem('ubakrie-lf-auth', JSON.stringify(session));
  }
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<p>Login required</p>} />
          <Route path="/" element={<p>Home page</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/private" element={<p>Private page</p>} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute role="Admin_BEM" />}>
              <Route path="/admin" element={<p>Admin page</p>} />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('Authentication route guards', () => {
  it('redirects unauthenticated visitors from protected pages to login', () => {
    renderProtectedPath('/private');

    expect(screen.getByText('Login required')).toBeInTheDocument();
  });

  it('keeps admin pages limited to the Admin_BEM role', () => {
    renderProtectedPath('/admin', {
      user: { id: 'student-1', nim: '12345678', role: 'MAHASISWA' },
      token: 'student-token',
    });

    expect(screen.getByText('Home page')).toBeInTheDocument();
  });

  it('allows Admin_BEM sessions to open admin pages', () => {
    renderProtectedPath('/admin', {
      user: { id: 'admin-1', nim: '10000001', role: 'Admin_BEM' },
      token: 'admin-token',
    });

    expect(screen.getByText('Admin page')).toBeInTheDocument();
  });

  it('lets a logged-in student log out from the user topbar', () => {
    localStorage.setItem(
      'ubakrie-lf-auth',
      JSON.stringify({
        user: {
          id: 'student-1',
          nim: '12345678',
          name: 'Ayu',
          role: 'MAHASISWA',
        },
        token: 'student-token',
      }),
    );
    const { container } = render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route element={<UserLayout />}>
              <Route path="/" element={<p>Home page</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    fireEvent.click(container.querySelector('.bottom-nav .logout-nav-link'));

    expect(localStorage.getItem('ubakrie-lf-auth')).toBeNull();
    expect(screen.getByRole('link', { name: 'Masuk' })).toBeInTheDocument();
    expect(screen.getByText('Home page')).toBeInTheDocument();
  });
});
