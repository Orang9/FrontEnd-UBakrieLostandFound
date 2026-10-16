import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <main className="auth-shell">
      <header className="auth-header">
        <span className="auth-logo-mark" aria-hidden="true">
          UB
        </span>
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
