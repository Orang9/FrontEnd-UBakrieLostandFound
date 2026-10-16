import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button.jsx';
import { useToast } from '../../../app/providers/ToastProvider.jsx';
import { useAuth } from '../../../app/providers/AuthProvider.jsx';
import { SYSTEM_MESSAGES } from '../../../constants/messages.js';
import { paths } from '../../../app/router/paths.js';
import { loginAdmin, loginStudent } from '../api/authApi.js';

export function LoginPage() {
  const [accountType, setAccountType] = useState('student');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { notify } = useToast();

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      const response =
        accountType === 'student'
          ? await loginStudent({
              nim: values.identifier.trim(),
              password: values.password,
            })
          : await loginAdmin({
              nip: values.identifier.trim(),
              password: values.password,
            });
      const account = response.data;
      const user = {
        ...account,
        role: account.role,
        identifier: account.nim ?? account.nip,
      };
      login({ user, token: account.token });
      const returnTo = location.state?.from?.pathname;
      const isAdmin = account.role !== 'user';
      const target =
        returnTo && returnTo.startsWith('/admin') === isAdmin
          ? returnTo
          : isAdmin
            ? paths.admin.dashboard
            : paths.home;
      navigate(target, { replace: true });
    } catch (error) {
      notify(
        error.response?.data?.message || SYSTEM_MESSAGES.networkError,
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-content">
      <h1>Masuk</h1>
      <p className="auth-subtitle">Masuk menggunakan akun terdaftar</p>
      <div className="report-segmented" role="group" aria-label="Jenis akun">
        <button
          className={`report-segment${accountType === 'student' ? ' is-active' : ''}`}
          type="button"
          aria-pressed={accountType === 'student'}
          onClick={() => setAccountType('student')}
        >
          Mahasiswa
        </button>
        <button
          className={`report-segment${accountType === 'admin' ? ' is-active' : ''}`}
          type="button"
          aria-pressed={accountType === 'admin'}
          onClick={() => setAccountType('admin')}
        >
          Admin / Satpam
        </button>
      </div>
      <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <label className="auth-field" htmlFor="identifier">
          <span>{accountType === 'student' ? 'NIM' : 'NIP'}</span>
          <input
            id="identifier"
            type="text"
            inputMode="numeric"
            autoComplete="username"
            placeholder={
              accountType === 'student'
                ? 'Nomor Induk Mahasiswa'
                : 'Nomor Induk Pegawai'
            }
            aria-invalid={Boolean(errors.identifier)}
            aria-describedby={
              errors.identifier ? 'identifier-error' : undefined
            }
            {...register('identifier', {
              required: `${accountType === 'student' ? 'NIM' : 'NIP'} wajib diisi.`,
              pattern: {
                value: /^\d+$/,
                message: `${accountType === 'student' ? 'NIM' : 'NIP'} harus berupa angka.`,
              },
            })}
          />
          {errors.identifier && (
            <span
              className="auth-field-error"
              id="identifier-error"
              role="alert"
            >
              {errors.identifier.message}
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
        <Button className="auth-submit" type="submit" disabled={submitting}>
          {submitting ? 'Memproses...' : 'Masuk'}
        </Button>
      </form>
      <p className="auth-access-note">
        Gunakan NIM mahasiswa atau NIP pegawai yang terdaftar.
      </p>
      {accountType === 'student' && (
        <p>
          Belum memiliki akun? <Link to={paths.register}>Daftar mahasiswa</Link>
        </p>
      )}
      <Link className="auth-home-link" to={paths.home}>
        Kembali ke beranda
      </Link>
    </section>
  );
}
