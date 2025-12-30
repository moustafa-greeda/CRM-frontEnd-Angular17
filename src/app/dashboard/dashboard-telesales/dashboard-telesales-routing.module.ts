import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardTelesalesComponent } from './dashboard-telesales.component';
import { CallsComponent } from './components/calls/calls.component';
import { FollowUpTeleSalesComponent } from './components/follow-up-tele-sales/follow-up-table-tele-sales.component';
import { DetailsFollowUpTeleComponent } from './components/follow-up-tele-sales/details-follow-up-tele/details-follow-up-tele.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardTelesalesComponent,
  },
  {
    path: 'follow-up-tele',
    component: FollowUpTeleSalesComponent,
  },
  {
    path: 'follow-up-tele/view/:contactId',
    component: DetailsFollowUpTeleComponent,
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
