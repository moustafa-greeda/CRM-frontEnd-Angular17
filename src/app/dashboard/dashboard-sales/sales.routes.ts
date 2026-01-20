import { Routes } from '@angular/router';
import { DashboardSalesComponent } from './dashboard-sales.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

export const salesRoutes: Routes = [
  {
    path: '',
    component: DashboardSalesComponent,
    data: { roles: ['Sales'] },
    canActivate: [AuthGuard, RoleGuard],
  },
];
