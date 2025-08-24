import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './Auth/login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { TasksComponent } from './dashboard/tasks/tasks.component';
import { DepartmentsComponent } from './components/departments/departments.component';
import { DashboardAdminComponent } from './dashboard/dashboard-admin/dashboard-admin.component';
import { DashboardCustomerComponent } from './dashboard/dashboard-customer/dashboard-customer.component';
import { DashboardEmployeeComponent } from './dashboard/dashboard-employee/dashboard-employee.component';
import { EmployeeComponent } from './components/employee/employee.component';
import { HomeAdminComponent } from './components/home-admin/home-admin.component';
import { ResetPasswordComponent } from './Auth/reset-password/reset-password.component';
import { ForgetPasswordComponent } from './Auth/forget-password/forget-password.component';
import { OtpComponent } from './Auth/otp/otp.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'forget-password', component: ForgetPasswordComponent },
  { path: 'otp-password', component: OtpComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  {
    path: 'dashboard',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },

      // Common routes
      { path: 'tasks', component: TasksComponent },
      // Role-based dashboards
      {
        path: 'admin',
        component: DashboardAdminComponent,
        children: [
          { path: '', redirectTo: 'home', pathMatch: 'full' },
          { path: 'home', component: HomeAdminComponent },
          { path: 'departments', component: DepartmentsComponent },
          { path: 'employee', component: EmployeeComponent },
        ],
      },
      { path: 'customer', component: DashboardCustomerComponent },
      { path: 'employee', component: DashboardEmployeeComponent },
      //
    ],
  },

  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
