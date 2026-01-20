import { Routes } from '@angular/router';
import { LoginGuard } from '../core/guards/login.guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((m) => m.LoginComponent),
    canActivate: [LoginGuard],
  },
  {
    path: 'forget-password',
    loadComponent: () =>
      import('./forget-password/forget-password.component').then(
        (m) => m.ForgetPasswordComponent
      ),
    canActivate: [LoginGuard],
  },
  {
    path: 'otp-password',
    loadComponent: () =>
      import('./otp/otp.component').then((m) => m.OtpComponent),
    canActivate: [LoginGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
    canActivate: [LoginGuard],
  },
];
