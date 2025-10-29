import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LoginComponent } from './Auth/login/login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { LayoutComponent } from './layout/layout.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SpinnerInterceptor } from './core/loader/spinner.interceptor';
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

import { AppRoutingModule } from './app-routing.module';
import { FormDialogComponent } from './shared/form/form-dialog/form-dialog.component';
import { ConfirmDeleteComponent } from './shared/form/confirm-delete/confirm-delete.component';
import { SharedComponentsModule } from './shared/components/shared-components.module';
import { FooterComponent } from './layout/footer/footer.component';
import { HeaderComponent } from './layout/header/nav.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { DashboardAdminComponent } from './dashboard/dashboard-admin/dashboard-admin.component';
import { DashboardCustomerComponent } from './dashboard/dashboard-customer/dashboard-customer.component';
import { DashboardEmployeeComponent } from './dashboard/dashboard-employee/dashboard-employee.component';
import { DashboardTelesalesComponent } from './dashboard/dashboard-telesales/dashboard-telesales.component';
import { DashboardSalesComponent } from './dashboard/dashboard-sales/dashboard-sales.component';
import { DashboardAccountComponent } from './dashboard/dashboard-account/dashboard-account.component';
import { DashboardTechComponent } from './dashboard/dashboard-tech/dashboard-tech.component';
import { FirstChartsComponent } from './components/home-admin/first-charts/first-charts.component';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { HomeAdminComponent } from './components/home-admin/home-admin.component';
import { NotifyDialogHostComponent } from './shared/notify-dialog-host/notify-dialog-host.component';
import { BidiModule } from '@angular/cdk/bidi';
import { ForgetPasswordComponent } from './Auth/forget-password/forget-password.component';
import { ResetPasswordComponent } from './Auth/reset-password/reset-password.component';
import { OtpComponent } from './Auth/otp/otp.component';
import { CitiesComponent } from './components/cities/cities.component';
import { CountriesComponent } from './components/countries/countries.component';
import { WizardComponent } from './components/wizard/wizard.component';
import { StepsModule } from './components/wizard/steps/steps.module';
import { FilterLeadsModule } from './components/filter-leads/filter-leads.module';
import { AuthTokenInterceptor } from './core/auth-token.interceptor';
import { AuthErrorInterceptor } from './core/guards/auth-error.interceptor';
import { FeedbackLeadsComponent } from './components/feedback-leads/feedback-leads.component';
import { ChartFeedbackComponent } from './components/feedback-leads/chart-feedback/chart-feedback.component';
import { ShowLeadsComponent } from './components/leads/show-leads/show-leads.component';
import { TabelDealsComponent } from './components/deals/tabel-deals/tabel-deals.component';
import { DistributionComponent } from './components/leads/distribution/distribution.component';
import { SearchInputComponent } from './shared/ui/search-input/search-input.component';
import { ButtonComponent } from './shared/ui/button/button.component';
import { DropdownComponent } from './shared/ui/dropdown/dropdown.component';
import { CountLeadComponent } from './shared/ui/count-lead/count-lead.component';
import { EmployeeComponent } from './components/employee/employee/employee.component';
import { GridCardsComponent } from './shared/ui/grid-cards/grid-cards.component';
import { CardComponent } from './shared/ui/card/card.component';
import { InfoBoxesComponent } from './shared/ui/info-boxes/info-boxes.component';
import { CompanyComponent } from './components/company/company.component';
import { CompanyWizardModule } from './shared/components/company-wizard/company-wizard.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LayoutComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    FormDialogComponent,
    ConfirmDeleteComponent,
    DashboardAdminComponent,
    DashboardCustomerComponent,
    DashboardEmployeeComponent,
    DashboardTelesalesComponent,
    DashboardSalesComponent,
    DashboardAccountComponent,
    DashboardTechComponent,
    FirstChartsComponent,
    HomeAdminComponent,
    NotifyDialogHostComponent,
    ForgetPasswordComponent,
    ResetPasswordComponent,
    OtpComponent,
    CitiesComponent,
    CountriesComponent,
    WizardComponent,
    FeedbackLeadsComponent,
    ChartFeedbackComponent,
    ShowLeadsComponent,
    TabelDealsComponent,
    DistributionComponent,
    SearchInputComponent,
    ButtonComponent,
    DropdownComponent,
    CountLeadComponent,
    EmployeeComponent,
    GridCardsComponent,
    CardComponent,
    InfoBoxesComponent,
    CompanyComponent,
  ],
  imports: [
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
    MatIconModule,
    MatDatepickerModule,
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
    SharedComponentsModule,
    CompanyWizardModule,
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),

    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true },
    // Enable fetch for HttpClient and wire up DI interceptors
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
