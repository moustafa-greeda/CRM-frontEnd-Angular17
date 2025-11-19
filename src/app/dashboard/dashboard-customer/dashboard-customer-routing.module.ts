import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardCustomerComponent } from './dashboard-customer.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardCustomerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardCustomerRoutingModule {}
