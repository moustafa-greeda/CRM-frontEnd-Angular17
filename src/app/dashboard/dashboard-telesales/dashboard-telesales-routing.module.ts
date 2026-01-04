import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardTelesalesComponent } from './dashboard-telesales.component';
import { FollowUpTeleSalesComponent } from './components/follow-up-tele-sales/follow-up-table-tele-sales.component';
import { DetailsFollowUpTeleComponent } from './components/follow-up-tele-sales/details-follow-up-tele/details-follow-up-tele.component';
import { ActiviteisComponent } from './components/follow-up-tele-sales/details-follow-up-tele/components/activiteis/activiteis.component';
import { NotesComponent } from './components/follow-up-tele-sales/details-follow-up-tele/components/notes/notes.component';
import { FilesComponent } from './components/follow-up-tele-sales/details-follow-up-tele/components/files/files.component';
import { MailsComponent } from './components/follow-up-tele-sales/details-follow-up-tele/components/mails/mails.component';
import { CallsComponent } from './components/follow-up-tele-sales/details-follow-up-tele/components/calls/calls.component';

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
    children: [
      {
        path: '',
        redirectTo: 'activiteis',
        pathMatch: 'full',
      },
      {
        path: 'activiteis',
        component: ActiviteisComponent,
      },
      {
        path: 'notes',
        component: NotesComponent,
      },
      {
        path: 'calls',
        component: CallsComponent,
      },
      {
        path: 'files',
        component: FilesComponent,
      },
      {
        path: 'mails',
        component: MailsComponent,
      },
    ],
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
