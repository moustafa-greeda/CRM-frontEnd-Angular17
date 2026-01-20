import { Routes } from '@angular/router';
import { DashboardEmployeeComponent } from './dashboard-employee.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

export const employeeRoutes: Routes = [
  {
    path: '',
    component: DashboardEmployeeComponent,
    data: { roles: ['Employee'] },
    canActivate: [AuthGuard, RoleGuard],
  },
];
