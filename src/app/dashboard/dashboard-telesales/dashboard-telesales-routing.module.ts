import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardTelesalesComponent } from './dashboard-telesales.component';
import { CallsComponent } from './calls/calls.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardTelesalesComponent,
  },
  {
    path: 'calls',
    component: CallsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardTelesalesRoutingModule {}
