import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/Button.jsx';
import { useToast } from '../../../app/providers/ToastProvider.jsx';
import { SYSTEM_MESSAGES } from '../../../constants/messages.js';
import { paths } from '../../../app/router/paths.js';

const CAMPUS_EMAIL_DOMAINS = ['student.bakrie.ac.id', 'bakrie.ac.id'];

function isCampusEmail(value) {
  const domain = value.trim().toLowerCase().split('@').at(-1);
  return CAMPUS_EMAIL_DOMAINS.includes(domain);
}

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { notify } = useToast();

  function onSubmit() {
    notify(SYSTEM_MESSAGES.authUnavailable, 'info');
  }

  return (
    <section className="auth-content">
      <h1>Masuk</h1>
      <p className="auth-subtitle">Gunakan akun email kampus</p>
      <form className="auth-form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <label className="auth-field" htmlFor="email">
          <span>Email Kampus</span>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="nama@student.bakrie.ac.id"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email', {
              required: 'Email kampus wajib diisi.',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Masukkan alamat email yang valid.',
              },
              validate: (value) =>
                isCampusEmail(value) ||
                'Gunakan email @student.bakrie.ac.id atau @bakrie.ac.id.',
            })}
          />
          {errors.email && (
            <span className="auth-field-error" id="email-error" role="alert">
              {errors.email.message}
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
        <Button className="auth-submit" type="submit">
          Masuk
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
