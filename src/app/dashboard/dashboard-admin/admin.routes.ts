import { Routes } from '@angular/router';
import { DashboardAdminComponent } from './dashboard-admin.component';
// All page components are now standalone - loaded via loadComponent
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    component: DashboardAdminComponent,
    children: [
      {
        path: '',
        redirectTo: 'teleSales',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('../../pages/home-admin/home-admin.component').then(
            (m) => m.HomeAdminComponent
          ),
        data: { roles: ['Admin'] },
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: 'teleSales',
        loadComponent: () =>
          import('../../pages/teleSales/teleSales.component').then(
            (m) => m.TeleSalesComponent
          ),
        data: { roles: ['Admin'] },
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: 'sales',
        loadComponent: () =>
          import('../../pages/sales/sales.component').then(
            (m) => m.SalesComponent
          ),
        data: { roles: ['Admin'] },
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('../../pages/invoices/invoices.component').then(
            (m) => m.InvoicesComponent
          ),
        data: { roles: ['Admin'] },
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: 'employee',
        loadComponent: () =>
          import('../../pages/employee/employee/employee.component').then(
            (m) => m.EmployeeComponent
          ),
        data: { roles: ['Admin'] },
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: 'company',
        loadComponent: () =>
          import('../../pages/company/company.component').then(
            (m) => m.CompanyComponent
          ),
        data: { roles: ['Admin'] },
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: 'addLead',
        loadComponent: () =>
          import('../../pages/leads/wizard/wizard.component').then(
            (m) => m.WizardComponent
          ),
        data: { roles: ['Admin'] },
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: 'showLeads',
        loadComponent: () =>
          import('../../pages/leads/show-leads/show-leads.component').then(
            (m) => m.ShowLeadsComponent
          ),
        data: { roles: ['Admin'] },
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: 'showdeals',
        loadComponent: () =>
          import('../../pages/deals/tabel-deals.component').then(
            (m) => m.TabelDealsComponent
          ),
        data: { roles: ['Admin'] },
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: 'distribution',
        loadComponent: () =>
          import('../../pages/leads/distribution/distribution.component').then(
            (m) => m.DistributionComponent
          ),
        data: { roles: ['Admin'] },
        canActivate: [AuthGuard, RoleGuard],
      },
      {
        path: 'exportedData',
        loadComponent: () =>
          import('../../pages/exported-data/exported-data.component').then(
            (m) => m.ExportedDataComponent
          ),
        data: { roles: ['Admin'] },
        canActivate: [AuthGuard, RoleGuard],
      },
    ],
  },
];
