import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from '../../layouts/AdminLayout.jsx';
import { AuthLayout } from '../../layouts/AuthLayout.jsx';
import { UserLayout } from '../../layouts/UserLayout.jsx';
import { AuditPage } from '../../features/audit/index.js';
import { CatalogPage } from '../../features/catalog/index.js';
import { ClaimPage, ReviewClaimsPage } from '../../features/claim/index.js';
import { DashboardPage } from '../../features/dashboard/index.js';
import { LoginPage } from '../../features/auth/index.js';
import { EticketPage } from '../../features/eticket/index.js';
import { HomePage } from '../../features/home/index.js';
import { IntakePage } from '../../features/intake/index.js';
import { ProfilePage } from '../../features/profile/index.js';
import { ReportItemPage } from '../../features/report-item/index.js';
import {
  SchedulingPage,
  AdminSchedulingPage,
} from '../../features/scheduling/index.js';
import { ScannerPage } from '../../features/scanner/index.js';
import { paths } from './paths.js';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { RoleRoute } from './RoleRoute.jsx';

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: paths.login, element: <LoginPage /> }],
  },
  {
    element: <UserLayout />,
    children: [
      { path: paths.home, element: <HomePage /> },
      { path: paths.catalog, element: <CatalogPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: paths.catalogItem(), element: <ClaimPage /> },
          { path: paths.claim(), element: <ClaimPage /> },
          { path: paths.reportItem, element: <ReportItemPage /> },
          { path: paths.profile, element: <ProfilePage /> },
          { path: paths.scheduling, element: <SchedulingPage /> },
          { path: paths.eticket(), element: <EticketPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleRoute role="ADMIN_BEM" />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: paths.admin.dashboard, element: <DashboardPage /> },
              { path: paths.admin.scanner, element: <ScannerPage /> },
              { path: paths.admin.intake, element: <IntakePage /> },
              { path: paths.admin.claims, element: <ReviewClaimsPage /> },
              {
                path: paths.admin.scheduling,
                element: <AdminSchedulingPage />,
              },
              { path: paths.admin.audit, element: <AuditPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
