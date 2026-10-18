import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/app/providers/AuthProvider.jsx';
import { ToastProvider } from '../../src/app/providers/ToastProvider.jsx';
import { login } from '../../src/features/auth/api/authApi.js';
import { LoginPage } from '../../src/features/auth/index.js';

vi.mock('../../src/features/auth/api/authApi.js', () => ({
  login: vi.fn(),
}));

afterEach(cleanup);

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
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
  it('requires a numeric NIM and password instead of campus email', async () => {
    renderLogin();

    expect(screen.getByLabelText('NIM')).toHaveAttribute(
      'inputmode',
      'numeric',
    );
    expect(screen.queryByLabelText('Email Kampus')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('NIM'), {
      target: { value: 'nim-mahasiswa' },
    });
    fireEvent.change(screen.getByLabelText('Kata Sandi'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(
      await screen.findByText('NIM hanya boleh berisi angka.'),
    ).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('submits NIM and password and stores the authenticated session', async () => {
    login.mockResolvedValue({
      user: {
        id: 'student-1',
        nim: '12345678',
        name: 'Ayu',
        role: 'MAHASISWA',
      },
      token: 'test-token',
    });
    renderLogin();

    fireEvent.change(screen.getByLabelText('NIM'), {
      target: { value: ' 12345678 ' },
    });
    fireEvent.change(screen.getByLabelText('Kata Sandi'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        nim: '12345678',
        password: 'password',
      });
    });
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('ubakrie-lf-auth'))).toEqual({
        user: {
          id: 'student-1',
          nim: '12345678',
          name: 'Ayu',
          role: 'MAHASISWA',
        },
        token: 'test-token',
      });
    });
  });

  it('shows the backend login error when authentication fails', async () => {
    login.mockRejectedValue({
      response: { status: 401, data: { message: 'Akun tidak ditemukan.' } },
    });
    renderLogin();

    fireEvent.change(screen.getByLabelText('NIM'), {
      target: { value: '12345678' },
    });
    fireEvent.change(screen.getByLabelText('Kata Sandi'), {
      target: { value: 'wrong-password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Akun tidak ditemukan.',
    );
  });
});
