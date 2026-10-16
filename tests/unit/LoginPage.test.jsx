import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import { ToastProvider } from '../../src/app/providers/ToastProvider.jsx';
import { LoginPage } from '../../src/features/auth/index.js';

afterEach(cleanup);

function renderLogin() {
  return render(
    <ToastProvider>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </ToastProvider>,
  );
}

describe('LoginPage', () => {
  it('rejects email addresses outside the supported campus domains', async () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText('Email Kampus'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Kata Sandi'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(
      await screen.findByText(
        'Gunakan email @student.bakrie.ac.id atau @bakrie.ac.id.',
      ),
    ).toBeInTheDocument();
  });

  it('shows that authentication still requires backend integration for valid campus credentials', async () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText('Email Kampus'), {
      target: { value: 'user@student.bakrie.ac.id' },
    });
    fireEvent.change(screen.getByLabelText('Kata Sandi'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Autentikasi belum dihubungkan dengan backend.',
    );
  });
});
