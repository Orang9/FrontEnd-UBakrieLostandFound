import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <main className="auth-shell">
      <header className="auth-header">
        <img
          className="auth-logo-mark"
          src="/LostandFound.jpeg"
          alt=""
          aria-hidden="true"
        />
        <h1>UBakrie Lost &amp; Found</h1>
        <p>Temukan barangmu, kembalikan milik mereka</p>
      </header>
      <div className="auth-main">
        <Outlet />
      </div>
      <footer className="auth-footer">
        Hanya Admin BEM yang memiliki akun administrator
      </footer>
    </main>
  );
}
