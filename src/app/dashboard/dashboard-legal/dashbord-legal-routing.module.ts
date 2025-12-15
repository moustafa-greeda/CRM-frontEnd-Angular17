import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLegalComponent } from './dashboard-legal.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardLegalComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardLegalRoutingModule {}
