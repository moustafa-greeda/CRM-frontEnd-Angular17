import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { NgxSpinnerModule } from 'ngx-spinner';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BidiModule } from '@angular/cdk/bidi';

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
import { AppComponent } from './app.component';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './layout/header/nav.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { ConfirmDeleteComponent } from './shared/components/confirm-delete/confirm-delete.component';
import { NotifyDialogHostComponent } from './shared/components/notify-dialog-host/notify-dialog-host.component';
import { GridCardsComponent } from './shared/ui/grid-cards/grid-cards.component';
import { CardComponent } from './shared/components/card/card.component';
import { InfoBoxesComponent } from './shared/ui/info-boxes/info-boxes.component';

import { HomeAdminComponent } from './components/home-admin/home-admin.component';
import { CitiesComponent } from './components/cities/cities.component';
import { CountriesComponent } from './components/countries/countries.component';
import { WizardComponent } from './components/leads/wizard/wizard.component';
import { ShowLeadsComponent } from './components/leads/show-leads/show-leads.component';
import { TabelDealsComponent } from './components/deals/tabel-deals/tabel-deals.component';
import { DistributionComponent } from './components/leads/distribution/distribution.component';
import { EmployeeComponent } from './components/employee/employee/employee.component';
import { CompanyComponent } from './components/company/company.component';
import { ExportedDataComponent } from './components/exported-data/exported-data.component';

import { SharedComponentsModule } from './shared/components/shared-components.module';
import { StepsModule } from './components/leads/wizard/steps/steps.module';
import { CompanyWizardModule } from './shared/components/company-wizard/company-wizard.module';

import { SpinnerInterceptor } from './core/loader/spinner.interceptor';
import { AuthTokenInterceptor } from './core/auth-token.interceptor';
import { AuthErrorInterceptor } from './core/guards/auth-error.interceptor';

const MATERIAL_MODULES = [
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
];

const CORE_LAYOUT_COMPONENTS = [
  LayoutComponent,
  HeaderComponent,
  SidebarComponent,
  FooterComponent,
];

const DASHBOARD_COMPONENTS: any[] = [];

const FEATURE_COMPONENTS = [
  HomeAdminComponent,
  CitiesComponent,
  CountriesComponent,
  WizardComponent,
  ShowLeadsComponent,
  TabelDealsComponent,
  DistributionComponent,
  EmployeeComponent,
  CompanyComponent,
  ExportedDataComponent,
];

const SHARED_PRESENTATIONAL_COMPONENTS = [
  ConfirmDeleteComponent,
  NotifyDialogHostComponent,
  GridCardsComponent,
  CardComponent,
  InfoBoxesComponent,
];

@NgModule({
  declarations: [
    AppComponent,
    ...CORE_LAYOUT_COMPONENTS,
    ...DASHBOARD_COMPONENTS,
    ...FEATURE_COMPONENTS,
    ...SHARED_PRESENTATIONAL_COMPONENTS,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule,
    ...MATERIAL_MODULES,
    NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' }),
    CanvasJSAngularChartsModule,
    StepsModule,
    SharedComponentsModule,
    CompanyWizardModule,
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: AuthErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true },
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
