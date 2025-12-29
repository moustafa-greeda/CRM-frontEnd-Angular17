import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLegalComponent } from './dashboard-legal.component';
import { RoleGuard } from '../../core/guards/role.guard';
import { AuthGuard } from '../../core/guards/auth.guard';
import { ContractComponent } from './components/contract/contract.component';

const routes: Routes = [
  {
    //   path: '',
    //   redirectTo: '/dashboard/dashboard-legal',
    //   pathMatch: 'full',
    //   data: { roles: ['Legal'] },
    //   canActivate: [AuthGuard, RoleGuard],
    //   component: DashboardLegalComponent,
    // },
    path: '',
    data: { roles: ['Legal Affairs'] },
    canActivate: [AuthGuard, RoleGuard],
    component: ContractComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardLegalRoutingModule {}
