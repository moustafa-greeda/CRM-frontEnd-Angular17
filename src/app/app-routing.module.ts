import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Auth/login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardAdminComponent } from './dashboard/dashboard-admin/dashboard-admin.component';
import { DashboardCustomerComponent } from './dashboard/dashboard-customer/dashboard-customer.component';
import { DashboardEmployeeComponent } from './dashboard/dashboard-employee/dashboard-employee.component';
import { HomeAdminComponent } from './components/home-admin/home-admin.component';
import { ResetPasswordComponent } from './Auth/reset-password/reset-password.component';
import { ForgetPasswordComponent } from './Auth/forget-password/forget-password.component';
import { OtpComponent } from './Auth/otp/otp.component';
import { CitiesComponent } from './components/cities/cities.component';
import { CountriesComponent } from './components/countries/countries.component';
import { WizardComponent } from './components/wizard/wizard.component';
import { FilterLeadsComponent } from './components/filter-leads/filter-leads.component';
// Guards
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { LoginGuard } from './core/guards/login.guard';
import { FeedbackLeadsComponent } from './components/feedback-leads/feedback-leads.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'forget-password',
    component: ForgetPasswordComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'otp-password',
    component: OtpComponent,
    canActivate: [LoginGuard],
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [LoginGuard],
  },

  // Protected dashboard routes
  {
    path: 'dashboard',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'admin', pathMatch: 'full' },

      // Admin routes
      {
        path: 'admin',
        component: DashboardAdminComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Admin', 'Customer'] },
        children: [
          { path: '', redirectTo: 'home', pathMatch: 'full' },
          {
            path: 'home',
            component: HomeAdminComponent,
            canActivate: [AuthGuard, RoleGuard],
            data: { roles: ['Admin', 'Customer'] },
          },
          {
            path: 'feedbackLeads',
            component: FeedbackLeadsComponent,
            canActivate: [AuthGuard, RoleGuard],
            data: { roles: ['Admin', 'Customer'] },
          },
          {
            path: 'countries',
            component: CountriesComponent,
            canActivate: [AuthGuard, RoleGuard],
            data: { roles: ['Admin', 'Customer'] },
          },
          {
            path: 'cities',
            component: CitiesComponent,
            canActivate: [AuthGuard, RoleGuard],
            data: { roles: ['Admin', 'Customer'] },
          },
          {
            path: 'addLead',
            component: WizardComponent,
            canActivate: [AuthGuard, RoleGuard],
            data: { roles: ['Admin', 'Customer'] },
          },
          {
            path: 'filterLeads',
            component: FilterLeadsComponent,
            canActivate: [AuthGuard, RoleGuard],
            data: { roles: ['Admin', 'Customer'] },
          },
        ],
      },

      // Customer routes
      {
        path: 'customer',
        component: DashboardCustomerComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Customer'] },
      },

      // Employee routes
      {
        path: 'employee',
        component: DashboardEmployeeComponent,
        canActivate: [AuthGuard, RoleGuard],
        data: { roles: ['Employee'] },
      },
    ],
  },

  // Wildcard route - redirect to login
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
