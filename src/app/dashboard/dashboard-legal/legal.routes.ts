import { Routes } from '@angular/router';
import { DashboardLegalComponent } from './dashboard-legal.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

export const legalRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../../pages/pages-legal/contract/contract.component').then(
        (m) => m.ContractComponent
      ),
    data: { roles: ['Legal Affairs'] },
    canActivate: [AuthGuard, RoleGuard],
  },
];
