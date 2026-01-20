import { Routes } from '@angular/router';
import { DashboardCustomerComponent } from './dashboard-customer.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

export const customerRoutes: Routes = [
  {
    path: '',
    component: DashboardCustomerComponent,
    data: { roles: ['Customer'] },
    canActivate: [AuthGuard, RoleGuard],
  },
];
