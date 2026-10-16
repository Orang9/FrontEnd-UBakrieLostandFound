import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../app/providers/AuthProvider.jsx';
import { useToast } from '../../../app/providers/ToastProvider.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { paths } from '../../../app/router/paths.js';
import { registerStudent } from '../api/authApi.js';

export function RegisterPage() {
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function onSubmit(values) {
    setSubmitting(true);
    try {
      const response = await registerStudent({
        nim: values.nim.trim(),
        full_name: values.full_name.trim(),
        email: values.email.trim(),
        phone_number: values.phone_number.trim(),
        password: values.password,
      });
      login({
        user: {
          nim: values.nim.trim(),
          name: values.full_name.trim(),
          email: values.email.trim(),
          role: 'user',
        },
        token: response.token,
      });
      notify(response.message || 'Pendaftaran berhasil.', 'success');
      navigate(paths.home, { replace: true });
    } catch (error) {
      notify(
        error.response?.data?.message || 'Pendaftaran gagal. Coba kembali.',
        'error',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-content">
      <h1>Daftar Mahasiswa</h1>
      <p className="auth-subtitle">
        Buat akun untuk mengajukan klaim dan laporan
      </p>
      <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <label className="auth-field" htmlFor="register-nim">
          <span>NIM</span>
          <input
            id="register-nim"
            inputMode="numeric"
            autoComplete="username"
            {...register('nim', {
              required: 'NIM wajib diisi.',
              pattern: {
                value: /^\d+$/,
                message: 'NIM harus berupa angka.',
              },
            })}
          />
          {errors.nim && <span role="alert">{errors.nim.message}</span>}
        </label>
        <label className="auth-field" htmlFor="register-name">
          <span>Nama lengkap</span>
          <input
            id="register-name"
            autoComplete="name"
            {...register('full_name', {
              required: 'Nama lengkap wajib diisi.',
            })}
          />
          {errors.full_name && (
            <span role="alert">{errors.full_name.message}</span>
          )}
        </label>
        <label className="auth-field" htmlFor="register-email">
          <span>Email</span>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            {...register('email', {
              required: 'Email wajib diisi.',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Masukkan alamat email yang valid.',
              },
            })}
          />
          {errors.email && <span role="alert">{errors.email.message}</span>}
        </label>
        <label className="auth-field" htmlFor="register-phone">
          <span>Nomor telepon</span>
          <input
            id="register-phone"
            type="tel"
            autoComplete="tel"
            {...register('phone_number', {
              required: 'Nomor telepon wajib diisi.',
            })}
          />
          {errors.phone_number && (
            <span role="alert">{errors.phone_number.message}</span>
          )}
        </label>
        <label className="auth-field" htmlFor="register-password">
          <span>Kata sandi</span>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            {...register('password', {
              required: 'Kata sandi wajib diisi.',
              minLength: {
                value: 6,
                message: 'Kata sandi minimal 6 karakter.',
              },
            })}
          />
          {errors.password && (
            <span role="alert">{errors.password.message}</span>
          )}
        </label>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Mendaftarkan...' : 'Daftar'}
        </Button>
      </form>
      <p>
        Sudah punya akun? <Link to={paths.login}>Masuk</Link>
      </p>
    </section>
  );
}
