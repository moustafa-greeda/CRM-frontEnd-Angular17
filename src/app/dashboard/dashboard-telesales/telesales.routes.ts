import { Routes } from '@angular/router';

export const telesalesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard-telesales.component').then(
        (m) => m.DashboardTelesalesComponent
      ),
  },
  {
    path: 'follow-up-tele',
    loadComponent: () =>
      import('../../pages/pages-tele/follow-up-tele-sales/follow-up-table-tele-sales.component').then(
        (m) => m.FollowUpTeleSalesComponent
      ),
  },
  {
    path: 'follow-up-tele/view/:contactId',
    loadComponent: () =>
      import('../../pages/pages-tele/follow-up-tele-sales/details-follow-up-tele/details-follow-up-tele.component').then(
        (m) => m.DetailsFollowUpTeleComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'activiteis',
        pathMatch: 'full',
      },
      {
        path: 'activiteis',
        loadComponent: () =>
          import('../../pages/pages-tele/follow-up-tele-sales/details-follow-up-tele/components/activiteis/activiteis.component').then(
            (m) => m.ActiviteisComponent
          ),
      },
      {
        path: 'notes',
        loadComponent: () =>
          import('../../pages/pages-tele/follow-up-tele-sales/details-follow-up-tele/components/notes/notes.component').then(
            (m) => m.NotesComponent
          ),
      },
      {
        path: 'calls',
        loadComponent: () =>
          import('../../pages/pages-tele/follow-up-tele-sales/details-follow-up-tele/components/calls/calls.component').then(
            (m) => m.CallsComponent
          ),
      },
      {
        path: 'files',
        loadComponent: () =>
          import('../../pages/pages-tele/follow-up-tele-sales/details-follow-up-tele/components/files/files.component').then(
            (m) => m.FilesComponent
          ),
      },
      {
        path: 'mails',
        loadComponent: () =>
          import('../../pages/pages-tele/follow-up-tele-sales/details-follow-up-tele/components/mails/mails.component').then(
            (m) => m.MailsComponent
          ),
      },
    ],
  },
  {
    path: 'calls',
    loadComponent: () =>
      import('../../pages/pages-tele/calls/calls.component').then(
        (m) => m.CallsComponent
      ),
  },
  {
    path: 'assignToSales',
    loadComponent: () =>
      import('../../pages/pages-tele/assgin-to-sales/assgin-to-sales.component').then(
        (m) => m.AssginToSalesComponent
      ),
  },
];
