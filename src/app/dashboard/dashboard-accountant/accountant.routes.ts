import { Routes } from '@angular/router';
import { DashboardAccountantComponent } from './dashboard-accountant.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

export const accountantRoutes: Routes = [
  {
    path: '',
    component: DashboardAccountantComponent,
    data: { roles: ['Accountant'] },
    canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'invoicesWorkOrders',
    loadComponent: () =>
      import('../../pages/pages-accountant/invoice-work-orders/InvoiceWorkOrders.component').then(
        (m) => m.InvoiceWorkOrdersComponent
      ),
    data: { roles: ['Accountant'] },
    canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'invoices',
    loadComponent: () =>
      import('../../pages/invoices/invoices.component').then(
        (m) => m.InvoicesComponent
      ),
    data: { roles: ['Accountant'] },
    canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'payments',
    loadComponent: () =>
      import('../../pages/pages-accountant/payments/payments.component').then(
        (m) => m.PaymentsComponent
      ),
    data: { roles: ['Accountant'] },
    canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'expenses',
    loadComponent: () =>
      import('../../pages/pages-accountant/expenses/expenses.component').then(
        (m) => m.ExpensesComponent
      ),
    data: { roles: ['Accountant'] },
    canActivate: [AuthGuard, RoleGuard],
  },
];
