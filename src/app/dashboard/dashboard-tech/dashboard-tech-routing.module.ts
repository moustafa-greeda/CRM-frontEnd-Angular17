import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardTechComponent } from './dashboard-tech.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardTechComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardTechRoutingModule {}
