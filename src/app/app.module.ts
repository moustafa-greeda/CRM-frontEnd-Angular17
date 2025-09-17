// import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
// import {
//   BrowserModule,
//   provideClientHydration,
// } from '@angular/platform-browser';

// import { AppComponent } from './app.component';
// import { LoginComponent } from './Auth/login/login.component';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { ToastrModule } from 'ngx-toastr';
// import { LayoutComponent } from './layout/layout.component';
// import { NgxSpinnerModule } from 'ngx-spinner';
// import { SpinnerInterceptor } from './core/loader/spinner.interceptor';
// import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// import { MatTableModule } from '@angular/material/table';
// import { MatPaginatorModule } from '@angular/material/paginator';
// import { MatSortModule } from '@angular/material/sort';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatDialogModule } from '@angular/material/dialog';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatButtonToggleModule } from '@angular/material/button-toggle';

// import { MatIcon, MatIconModule } from '@angular/material/icon';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { DepartmentsComponent } from './components/departments/departments.component';
// import { AppRoutingModule } from './app-routing.module';
// import { FormDialogComponent } from './shared/form/form-dialog/form-dialog.component';
// import { ConfirmDeleteComponent } from './shared/form/confirm-delete/confirm-delete.component';
// import { TableComponent } from './shared/table/table.component';
// import { FooterComponent } from './layout/footer/footer.component';
// import { HeaderComponent } from './layout/header/nav.component';
// import { SidebarComponent } from './layout/sidebar/sidebar.component';
// import { DashboardAdminComponent } from './dashboard/dashboard-admin/dashboard-admin.component';
// import { DashboardCustomerComponent } from './dashboard/dashboard-customer/dashboard-customer.component';
// import { DashboardEmployeeComponent } from './dashboard/dashboard-employee/dashboard-employee.component';
// import { MorningShiftComponent } from './components/home-admin/morning-shift/morning-shift.component';
// import { NightShiftComponent } from './components/home-admin/night-shift/night-shift.component';
// import { FirstChartsComponent } from './components/home-admin/first-charts/first-charts.component';
// import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
// import { HomeAdminComponent } from './components/home-admin/home-admin.component';
// import { NotifyDialogHostComponent } from './shared/notify-dialog-host/notify-dialog-host.component';
// import { BidiModule } from '@angular/cdk/bidi';
// import { MatSelectModule } from '@angular/material/select';
// import { MatNativeDateModule } from '@angular/material/core';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { ForgetPasswordComponent } from './Auth/forget-password/forget-password.component';
// import { ResetPasswordComponent } from './Auth/reset-password/reset-password.component';
// import { OtpComponent } from './Auth/otp/otp.component';
// import { LeadsComponent } from './components/leads/leads.component';
// import { ChatDialogComponent } from './components/leads/chat/chat-dialog.component';
// import { DistributionComponent } from './components/distribution/distribution.component';

// @NgModule({
//   declarations: [
//     AppComponent,
//     LoginComponent,
//     LayoutComponent,
//     HeaderComponent,
//     SidebarComponent,
//     FooterComponent,
//     DepartmentsComponent,
//     FormDialogComponent,
//     ConfirmDeleteComponent,
//     TableComponent,
//     DashboardAdminComponent,
//     DashboardCustomerComponent,
//     DashboardEmployeeComponent,
//     MorningShiftComponent,
//     NightShiftComponent,
//     FirstChartsComponent,
//     HomeAdminComponent,
//     NotifyDialogHostComponent,
//     ChatDialogComponent,
//     ForgetPasswordComponent,
//     ResetPasswordComponent,
//     LeadsComponent,
//     OtpComponent,
//     DistributionComponent,
//   ],
//   imports: [
//     BrowserModule,
//     AppRoutingModule,
//     FormsModule,
//     ReactiveFormsModule,
//     HttpClientModule,
//     BrowserAnimationsModule,
//     ToastrModule.forRoot({
//       timeOut: 3000,
//       preventDuplicates: true,
//     }),
//     NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
//     MatTableModule,
//     MatPaginatorModule,
//     MatSortModule,
//     MatProgressSpinnerModule,
//     MatDialogModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatButtonModule,
//     MatButtonToggleModule,
//     MatIconModule,
//     MatDatepickerModule,
//     BidiModule,
//     MatSelectModule,
//     MatDatepickerModule,
//     MatNativeDateModule,
//     MatCheckboxModule,
//     MatIcon,
//     CanvasJSAngularChartsModule,
//   ],
//   providers: [
//     provideClientHydration(),
//     {
//       provide: HTTP_INTERCEPTORS,
//       useClass: SpinnerInterceptor,
//       multi: true,
//     },
//     provideAnimationsAsync(),
//   ],
//   bootstrap: [AppComponent],
//   schemas: [CUSTOM_ELEMENTS_SCHEMA],
// })
// export class AppModule {}

import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LoginComponent } from './Auth/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { LayoutComponent } from './layout/layout.component';
import { NgxSpinnerModule } from 'ngx-spinner';
// import { SpinnerInterceptor } from './core/loader/spinner.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { DepartmentsComponent } from './components/departments/departments.component';
import { AppRoutingModule } from './app-routing.module';
import { FormDialogComponent } from './shared/form/form-dialog/form-dialog.component';
import { ConfirmDeleteComponent } from './shared/form/confirm-delete/confirm-delete.component';
import { TableComponent } from './shared/table/table.component';
import { FooterComponent } from './layout/footer/footer.component';
import { HeaderComponent } from './layout/header/nav.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { DashboardAdminComponent } from './dashboard/dashboard-admin/dashboard-admin.component';
import { DashboardCustomerComponent } from './dashboard/dashboard-customer/dashboard-customer.component';
import { DashboardEmployeeComponent } from './dashboard/dashboard-employee/dashboard-employee.component';
import { MorningShiftComponent } from './components/home-admin/morning-shift/morning-shift.component';
import { NightShiftComponent } from './components/home-admin/night-shift/night-shift.component';
import { FirstChartsComponent } from './components/home-admin/first-charts/first-charts.component';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { HomeAdminComponent } from './components/home-admin/home-admin.component';
import { NotifyDialogHostComponent } from './shared/notify-dialog-host/notify-dialog-host.component';
import { BidiModule } from '@angular/cdk/bidi';
import { ForgetPasswordComponent } from './Auth/forget-password/forget-password.component';
import { ResetPasswordComponent } from './Auth/reset-password/reset-password.component';
import { OtpComponent } from './Auth/otp/otp.component';
import { LeadsComponent } from './components/leads/leads.component';
import { ChatDialogComponent } from './components/leads/chat/chat-dialog.component';
import { DistributionComponent } from './components/distribution/distribution.component';
import { CitiesComponent } from './components/cities/cities.component';
import { CountriesComponent } from './components/countries/countries.component';
import { WizardComponent } from './components/wizard/wizard.component';
import { StepsModule } from './components/wizard/steps/steps.module';
import { FilterLeadsModule } from './components/filter-leads/filter-leads.module';
import { AuthTokenInterceptor } from './core/auth-token.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LayoutComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    DepartmentsComponent,
    FormDialogComponent,
    ConfirmDeleteComponent,
    TableComponent,
    DashboardAdminComponent,
    DashboardCustomerComponent,
    DashboardEmployeeComponent,
    MorningShiftComponent,
    NightShiftComponent,
    FirstChartsComponent,
    HomeAdminComponent,
    NotifyDialogHostComponent,
    ChatDialogComponent,
    ForgetPasswordComponent,
    ResetPasswordComponent,
    LeadsComponent,
    OtpComponent,
    DistributionComponent,
    CitiesComponent,
    CountriesComponent,
    WizardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,

    // UI libs
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule, // ✅ الموديول الصحيح
    MatDatepickerModule, // ✅ مرّة واحدة فقط
    MatNativeDateModule,
    MatSelectModule,
    MatCheckboxModule,
    BidiModule,

    // 3rd-party libs
    ToastrModule.forRoot({
      timeOut: 3000,
      preventDuplicates: true,
    }),
    NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
    CanvasJSAngularChartsModule,
    
    // Custom modules
    StepsModule,
    FilterLeadsModule,
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),

    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: SpinnerInterceptor,
    //   multi: true,
    // },
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
    // Enable fetch for HttpClient (better SSR compatibility)
    provideHttpClient(withFetch()),
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
