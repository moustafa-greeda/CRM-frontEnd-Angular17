import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardAccountComponent } from './dashboard-account.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardAccountComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardAccountRoutingModule {}
