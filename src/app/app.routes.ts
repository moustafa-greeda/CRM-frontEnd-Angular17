import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { AuthGuard } from './core/guards/auth.guard';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: '',
    loadChildren: () => import('./Auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'dashboard',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then(
        (m) => m.dashboardRoutes
      ),
  },
  { path: '**', redirectTo: 'login' },
];
