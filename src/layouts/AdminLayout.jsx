import { NavLink, Outlet } from 'react-router-dom';
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ScanLine,
  ShieldCheck,
  Warehouse,
} from 'lucide-react';
import { useAuth } from '../app/providers/AuthProvider.jsx';
import { paths } from '../app/router/paths.js';

const adminNavigation = [
  { to: paths.admin.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { to: paths.admin.scanner, label: 'Scanner', icon: ScanLine },
  { to: paths.admin.intake, label: 'Penerimaan', icon: Warehouse },
  { to: paths.admin.claims, label: 'Klaim', icon: ClipboardList },
  { to: paths.admin.scheduling, label: 'Jadwal', icon: ClipboardList },
  { to: paths.admin.audit, label: 'Audit', icon: ShieldCheck },
];

export function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            UB
          </span>
          Admin
        </div>
        <nav aria-label="Navigasi admin">
          {adminNavigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              end={to === paths.admin.dashboard}
              className={({ isActive }) =>
                `admin-nav-link${isActive ? ' is-active' : ''}`
              }
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
          <button
            className="admin-nav-link logout-button"
            onClick={logout}
            type="button"
          >
            <LogOut size={18} aria-hidden="true" />
            Keluar
          </button>
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
      <nav className="admin-mobile-nav" aria-label="Navigasi admin">
        {adminNavigation.map(({ to, label, icon: Icon }) => (
          <NavLink key={label} to={to} aria-label={label}>
            <Icon size={19} aria-hidden="true" />
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
