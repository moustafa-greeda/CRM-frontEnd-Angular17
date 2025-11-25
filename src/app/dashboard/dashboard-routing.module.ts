import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../core/guards/auth.guard';
import { RoleGuard } from '../core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./dashboard-admin/dashboard-admin.module').then(
        (m) => m.DashboardAdminModule
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin', 'Customer'] },
  },
  {
    path: 'telesales',
    loadChildren: () =>
      import('./dashboard-telesales/dashboard-telesales.module').then(
        (m) => m.DashboardTelesalesModule
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['TeleSalse'] },
  },
  {
    path: 'sales',
    loadChildren: () =>
      import('./dashboard-sales/dashboard-sales.module').then(
        (m) => m.DashboardSalesModule
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Sales'] },
  },
  {
    path: 'accountant',
    loadChildren: () =>
      import('./dashboard-accountant/dashboard-accountant.module').then(
        (m) => m.DashboardAccountModule
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Accountant'] },
  },
  {
    path: 'tech',
    loadChildren: () =>
      import('./dashboard-tech/dashboard-tech.module').then(
        (m) => m.DashboardTechModule
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Tech'] },
  },
  {
    path: 'customer',
    loadChildren: () =>
      import('./dashboard-customer/dashboard-customer.module').then(
        (m) => m.DashboardCustomerModule
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Customer'] },
  },
  {
    path: 'employee',
    loadChildren: () =>
      import('./dashboard-employee/dashboard-employee.module').then(
        (m) => m.DashboardEmployeeModule
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Employee'] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
