import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button.jsx';
import { useToast } from '../../../app/providers/ToastProvider.jsx';
import { useAuth } from '../../../app/providers/AuthProvider.jsx';
import { paths } from '../../../app/router/paths.js';
import { login as authenticate } from '../api/authApi.js';

function getLoginErrorMessage(error) {
  if (typeof error?.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  if (error?.response?.status === 401) {
    return 'NIM atau kata sandi tidak sesuai.';
  }
  if (error?.request && !error?.response) {
    return 'Tidak dapat terhubung ke server. Periksa koneksi Anda.';
  }
  return 'Login gagal. Silakan coba kembali.';
}

export function LoginPage() {
  const { login: saveSession, isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { notify } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  if (isAuthenticated) {
    return (
      <Navigate
        to={user?.role === 'Admin_BEM' ? paths.admin.dashboard : paths.home}
        replace
      />
    );
  }

  async function onSubmit(credentials) {
    try {
      const session = await authenticate({
        nim: credentials.nim.trim(),
        password: credentials.password,
      });
      saveSession(session);

      const destination = location.state?.from;
      const fallback =
        session.user.role === 'Admin_BEM' ? paths.admin.dashboard : paths.home;
      navigate(
        destination
          ? `${destination.pathname}${destination.search ?? ''}${destination.hash ?? ''}`
          : fallback,
        { replace: true },
      );
    } catch (error) {
      notify(getLoginErrorMessage(error), 'error');
    }
  }

  return (
    <section className="auth-content">
      <h1>Masuk</h1>
      <p className="auth-subtitle">Gunakan NIM dan kata sandi akun Anda</p>
      <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <label className="auth-field" htmlFor="nim">
          <span>NIM</span>
          <input
            id="nim"
            type="text"
            inputMode="numeric"
            autoComplete="username"
            placeholder="Masukkan NIM"
            aria-invalid={Boolean(errors.nim)}
            aria-describedby={errors.nim ? 'nim-error' : undefined}
            {...register('nim', {
              required: 'NIM wajib diisi.',
              validate: (value) =>
                /^\d+$/.test(value.trim()) || 'NIM hanya boleh berisi angka.',
            })}
          />
          {errors.nim && (
            <span className="auth-field-error" id="nim-error" role="alert">
              {errors.nim.message}
            </span>
          )}
        </label>
        <label className="auth-field" htmlFor="password">
          <span>Kata Sandi</span>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password', { required: 'Kata sandi wajib diisi.' })}
          />
          {errors.password && (
            <span className="auth-field-error" id="password-error" role="alert">
              {errors.password.message}
            </span>
          )}
        </label>
        <Button className="auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Memproses...' : 'Masuk'}
        </Button>
      </form>
      <p className="auth-access-note">
        Hanya untuk civitas academica Universitas Bakrie
      </p>
      <Link className="auth-home-link" to={paths.home}>
        Kembali ke beranda
      </Link>
    </section>
  );
}
