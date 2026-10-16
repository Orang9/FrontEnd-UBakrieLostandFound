import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider.jsx';
import { paths } from './paths.js';

export function RoleRoute({ role = 'ADMIN_BEM' }) {
  const { user } = useAuth();
  return user?.role === role ? (
    <Outlet />
  ) : (
    <Navigate to={paths.home} replace />
  );
}
