import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardSalesComponent } from './dashboard-sales.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardSalesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardSalesRoutingModule {}
