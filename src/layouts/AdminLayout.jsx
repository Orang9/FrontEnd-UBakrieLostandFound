import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ClipboardList,
  Boxes,
  LayoutGrid,
  LayoutDashboard,
  LogOut,
  Menu,
  ScanLine,
  ShieldCheck,
  X,
  Warehouse,
} from 'lucide-react';
import { useAuth } from '../app/providers/AuthProvider.jsx';
import { paths } from '../app/router/paths.js';

const adminNavigation = [
  { to: paths.admin.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: paths.admin.claims, label: 'Verifikasi Klaim', icon: ClipboardList },
  { to: paths.admin.scanner, label: 'Scan QR', icon: ScanLine },
  { to: paths.admin.intake, label: 'Intake Satpam', icon: Warehouse },
  { to: paths.admin.items, label: 'Kelola Barang', icon: Boxes },
  { to: paths.admin.scheduling, label: 'Kelola Slot', icon: LayoutGrid },
  { to: paths.admin.audit, label: 'Audit Trail', icon: ShieldCheck },
];

export function AdminLayout() {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const activeNavigation = adminNavigation.find(({ to }) => to === pathname);

  function closeMenu() {
    setMenuOpen(false);
  }

  function renderNavigation(className) {
    return (
      <nav className={className} aria-label="Navigasi admin">
        {adminNavigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            end={to === paths.admin.dashboard}
            className={({ isActive }) =>
              `admin-nav-link${isActive ? ' is-active' : ''}`
            }
            onClick={closeMenu}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
        <button
          className="admin-nav-link logout-button"
          onClick={() => {
            closeMenu();
            logout();
          }}
          type="button"
        >
          <LogOut size={18} aria-hidden="true" />
          Keluar
        </button>
      </nav>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-mobile-header">
        <div className="admin-mobile-brand">
          <span className="brand-mark" aria-hidden="true">
            UB
          </span>
          <span>{activeNavigation?.label ?? 'Admin BEM'}</span>
        </div>
        <button
          className="admin-menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Tutup menu admin' : 'Buka menu admin'}
          aria-expanded={menuOpen}
          aria-controls="admin-navigation-drawer"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X size={22} aria-hidden="true" />
          ) : (
            <Menu size={22} aria-hidden="true" />
          )}
        </button>
      </header>
      {menuOpen && (
        <button
          className="admin-drawer-backdrop"
          type="button"
          aria-label="Tutup menu admin"
          onClick={closeMenu}
        />
      )}
      <aside
        className={`admin-sidebar${menuOpen ? ' is-open' : ''}`}
        id="admin-navigation-drawer"
      >
        <Link className="admin-brand" to={paths.catalog} onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true">UB</span>
          <span>UBakrie Lost &amp; Found</span>
        </Link>
        {renderNavigation('admin-sidebar-nav')}
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
