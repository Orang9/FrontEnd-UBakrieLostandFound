import { Link, NavLink, Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Home, PackageSearch, PlusCircle, UserRound } from 'lucide-react';
import { useAuth } from '../app/providers/AuthProvider.jsx';
import { paths } from '../app/router/paths.js';

const navigation = [
  { to: paths.home, label: 'Home', icon: Home },
  { to: paths.catalog, label: 'Katalog', icon: PackageSearch },
  { to: paths.reportItem, label: 'Lapor', icon: PlusCircle },
  { to: paths.profile, label: 'Profil', icon: UserRound },
];

export function UserLayout() {
  const { isAuthenticated, user } = useAuth();
  const { pathname } = useLocation();
  const isHome = pathname === paths.home;
  const isCatalog = pathname === paths.catalog;
  const isReport = pathname === paths.reportItem;
  const isProfile = pathname === paths.profile;
  const isScheduling = pathname === paths.scheduling;
  const isEticket = pathname.startsWith('/tickets/');
  const isClaim =
    pathname.startsWith('/catalog/') || pathname.startsWith('/items/');

  return (
    <div
      className={`app-shell${isHome ? ' is-home' : ''}${isCatalog ? ' is-catalog' : ''}${isReport ? ' is-report' : ''}${isProfile ? ' is-profile' : ''}${isScheduling ? ' is-scheduling' : ''}${isEticket ? ' is-eticket' : ''}${isClaim ? ' is-claim' : ''}`}
    >
      <header className="topbar">
        <Link className="brand" to={paths.home}>
          <span className="brand-mark" aria-hidden="true">
            UB
          </span>
          <span>Lost &amp; Found</span>
        </Link>
        <div className="topbar-account">
          {isAuthenticated ? user?.name : <Link to={paths.login}>Masuk</Link>}
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
      </nav>
    </div>
  );
}
