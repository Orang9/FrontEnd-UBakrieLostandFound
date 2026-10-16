import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider } from '../../src/app/providers/AuthProvider.jsx';
import { ToastProvider } from '../../src/app/providers/ToastProvider.jsx';
import { LoginPage } from '../../src/features/auth/index.js';
import {
  loginAdmin,
  loginStudent,
} from '../../src/features/auth/api/authApi.js';

vi.mock('../../src/features/auth/api/authApi.js', () => ({
  loginAdmin: vi.fn(),
  loginStudent: vi.fn(),
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
});

beforeEach(() => {
  loginStudent.mockResolvedValue({
    data: {
      nim: '1232001011',
      name: 'Test Student',
      email: 'student@example.test',
      role: 'user',
      token: 'student-token',
    },
  });
  loginAdmin.mockResolvedValue({
    data: {
      nip: '2314',
      name: 'Test Admin',
      role: 'satpam',
      token: 'admin-token',
    },
  });
});

function renderLogin() {
  return render(
    <AuthProvider>
      <ToastProvider>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </ToastProvider>
    </AuthProvider>,
  );
}

describe('LoginPage', () => {
  it('submits a student NIM and password to student login', async () => {
    renderLogin();
    fireEvent.change(screen.getByLabelText('NIM'), {
      target: { value: '1232001011' },
    });
    fireEvent.change(screen.getByLabelText('Kata Sandi'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    await waitFor(() =>
      expect(loginStudent).toHaveBeenCalledWith({
        nim: '1232001011',
        password: 'password',
      }),
    );
    await waitFor(() =>
      expect(
        JSON.parse(localStorage.getItem('ubakrie-lf-auth')).user.name,
      ).toBe('Test Student'),
    );
  });

  it('uses the admin login endpoint for NIP credentials', async () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: 'Admin / Satpam' }));
    fireEvent.change(screen.getByLabelText('NIP'), {
      target: { value: '2314' },
    });
    fireEvent.change(screen.getByLabelText('Kata Sandi'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    await waitFor(() =>
      expect(loginAdmin).toHaveBeenCalledWith({
        nip: '2314',
        password: 'password',
      }),
    );
  });
});
