import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeAdminComponent } from '../../components/home-admin/home-admin.component';
import { EmployeeComponent } from '../../components/employee/employee/employee.component';
import { CompanyComponent } from '../../components/company/company.component';
import { CountriesComponent } from '../../components/countries/countries.component';
import { CitiesComponent } from '../../components/cities/cities.component';
import { WizardComponent } from '../../components/leads/wizard/wizard.component';
import { ShowLeadsComponent } from '../../components/leads/show-leads/show-leads.component';
import { TabelDealsComponent } from '../../components/deals/tabel-deals.component';
import { DistributionComponent } from '../../components/leads/distribution/distribution.component';
import { ExportedDataComponent } from '../../components/exported-data/exported-data.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { SalesComponent } from '../../components/sales/sales.component';
import { TeleSalesComponent } from '../../components/teleSales/teleSales.component';
import { InvoicesComponent } from '../../components/invoices/invoices.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'teleSales',
    pathMatch: 'full',
    // data: { roles: ['Admin'] },
    // canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'home',
    component: HomeAdminComponent,
    data: { roles: ['Admin'] },
    canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'teleSales',
    component: TeleSalesComponent,
    data: { roles: ['Admin'] },
    canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'sales',
    component: SalesComponent,
    data: { roles: ['Admin'] },
    canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'invoices',
    component: InvoicesComponent,
    data: { roles: ['Admin'] },
    canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'employee',
    component: EmployeeComponent,
    data: { roles: ['Admin'] },
    canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'company',
    component: CompanyComponent,
    data: { roles: ['Admin'] },
    canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'countries',
    component: CountriesComponent,
    data: { roles: ['Admin'] },
    canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'cities',
    component: CitiesComponent,
    data: { roles: ['Admin'] },
    canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'addLead',
    component: WizardComponent,
    data: { roles: ['Admin'] },
    canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'showLeads',
    component: ShowLeadsComponent,
    data: { roles: ['Admin'] },
    canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'showdeals',
    component: TabelDealsComponent,
    data: { roles: ['Admin'] },
    canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'distribution',
    component: DistributionComponent,
    data: { roles: ['Admin'] },
    canActivate: [AuthGuard, RoleGuard],
  },
  {
    path: 'exportedData',
    component: ExportedDataComponent,
    data: { roles: ['Admin'] },
    canActivate: [AuthGuard, RoleGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
