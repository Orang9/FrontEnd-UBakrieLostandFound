import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider.jsx';
import { paths } from './paths.js';

const ADMIN_ROLES = ['satpam', 'admin', 'super_admin', 'ADMIN_BEM'];

export function RoleRoute({ roles = ADMIN_ROLES }) {
  const { user } = useAuth();
  return roles.includes(user?.role) ? (
    <Outlet />
  ) : (
    <Navigate to={paths.home} replace />
  );
}
