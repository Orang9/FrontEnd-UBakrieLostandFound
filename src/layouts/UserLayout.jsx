import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  Home,
  LogOut,
  PackageSearch,
  PlusCircle,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../app/providers/AuthProvider.jsx';
import { paths } from '../app/router/paths.js';

const navigation = [
  { to: paths.home, label: 'Home', icon: Home },
  { to: paths.catalog, label: 'Katalog', icon: PackageSearch },
  { to: paths.reportItem, label: 'Lapor', icon: PlusCircle },
  { to: paths.profile, label: 'Profil', icon: UserRound },
];

export function UserLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = user?.role === 'Admin_BEM';
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === paths.home;
  const isCatalog = pathname === paths.catalog;
  const isReport = pathname === paths.reportItem;
  const isProfile = pathname === paths.profile;
  const isScheduling = pathname === paths.scheduling;
  const isEticket = pathname.startsWith('/tickets/');
  const isClaim =
    pathname.startsWith('/catalog/') || pathname.startsWith('/items/');
  const appShellClasses = [
    'app-shell',
    isAuthenticated ? 'is-authenticated' : '',
    isHome ? 'is-home' : '',
    isCatalog ? 'is-catalog' : '',
    isReport ? 'is-report' : '',
    isProfile ? 'is-profile' : '',
    isScheduling ? 'is-scheduling' : '',
    isEticket ? 'is-eticket' : '',
    isClaim ? 'is-claim' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'UB';

  function signOut() {
    logout();
    navigate(paths.home, { replace: true });
  }

  return (
    <div className={appShellClasses}>
      <header className="topbar">
        <Link className="brand" to={paths.home}>
          <span className="brand-mark" aria-hidden="true">
            UB
          </span>
          <span>UBakrie Lost &amp; Found</span>
        </Link>
        <nav className="topbar-navigation" aria-label="Navigasi utama">
          {navigation.map(({ to, label }) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                `topbar-nav-link${isActive || (label === 'Profil' && isEticket) ? ' is-active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <>
              <NavLink className="topbar-nav-link" to={paths.admin.dashboard}>
                Dashboard Admin
              </NavLink>
              <NavLink className="topbar-nav-link" to={paths.admin.items}>
                Barang
              </NavLink>
            </>
          )}
        </nav>
        <div className="topbar-account">
          {isAuthenticated ? (
            <>
              <span className="topbar-user-name">{user?.name}</span>
              <button className="topbar-logout" type="button" onClick={signOut}>
                Keluar
              </button>
            </>
          ) : (
            <Link to={paths.login}>Masuk</Link>
          )}
          <span className="topbar-avatar" aria-hidden="true">
            {initials}
          </span>
        </div>
      </header>
      <main className="page-content">
        <Outlet />
      </main>
      <nav className="bottom-nav" aria-label="Navigasi utama">
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `nav-link${isActive || (label === 'Profil' && isEticket) ? ' is-active' : ''}`
            }
          >
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
        {isAuthenticated && (
          <button
            className="nav-link logout-nav-link"
            type="button"
            onClick={signOut}
          >
            <LogOut size={20} aria-hidden="true" />
            <span>Keluar</span>
          </button>
        )}
      </nav>
    </div>
  );
}
