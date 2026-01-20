import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AuthGuard } from '../core/guards/auth.guard';
import { RoleGuard } from '../core/guards/role.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'admin',
        pathMatch: 'full',
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./dashboard-admin/admin.routes').then(
            (m) => m.adminRoutes
          ),
        canActivate: [RoleGuard],
        data: { roles: ['Admin'] },
      },
      {
        path: 'telesales',
        loadChildren: () =>
          import('./dashboard-telesales/telesales.routes').then(
            (m) => m.telesalesRoutes
          ),
        canActivate: [RoleGuard],
        data: { roles: ['TeleSalse'] },
      },
      {
        path: 'sales',
        loadChildren: () =>
          import('./dashboard-sales/sales.routes').then(
            (m) => m.salesRoutes
          ),
        canActivate: [RoleGuard],
        data: { roles: ['Sales'] },
      },
      {
        path: 'accountant',
        loadChildren: () =>
          import('./dashboard-accountant/accountant.routes').then(
            (m) => m.accountantRoutes
          ),
        canActivate: [RoleGuard],
        data: { roles: ['Accountant'] },
      },
      {
        path: 'tech',
        loadChildren: () =>
          import('./dashboard-tech/tech.routes').then(
            (m) => m.techRoutes
          ),
        canActivate: [RoleGuard],
        data: { roles: ['Tech'] },
      },
      {
        path: 'customer',
        loadChildren: () =>
          import('./dashboard-customer/customer.routes').then(
            (m) => m.customerRoutes
          ),
        canActivate: [RoleGuard],
        data: { roles: ['Customer'] },
      },
      {
        path: 'employee',
        loadChildren: () =>
          import('./dashboard-employee/employee.routes').then(
            (m) => m.employeeRoutes
          ),
        canActivate: [RoleGuard],
        data: { roles: ['Employee'] },
      },
      {
        path: 'legal',
        loadChildren: () =>
          import('./dashboard-legal/legal.routes').then(
            (m) => m.legalRoutes
          ),
        canActivate: [RoleGuard],
        data: { roles: ['Legal Affairs'] },
      },
    ],
  },
];
