import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeAdminComponent } from '../../components/home-admin/home-admin.component';
import { EmployeeComponent } from '../../components/employee/employee/employee.component';
import { CompanyComponent } from '../../components/company/company.component';
import { CountriesComponent } from '../../components/countries/countries.component';
import { CitiesComponent } from '../../components/cities/cities.component';
import { WizardComponent } from '../../components/leads/wizard/wizard.component';
import { ShowLeadsComponent } from '../../components/leads/show-leads/show-leads.component';
import { TabelDealsComponent } from '../../components/deals/tabel-deals/tabel-deals.component';
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
  },
  {
    path: 'home',
    component: HomeAdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'teleSales',
    component: TeleSalesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'sales',
    component: SalesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'invoices',
    component: InvoicesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'employee',
    component: EmployeeComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'company',
    component: CompanyComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'countries',
    component: CountriesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'cities',
    component: CitiesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'addLead',
    component: WizardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'showLeads',
    component: ShowLeadsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'showdeals',
    component: TabelDealsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'distribution',
    component: DistributionComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'exportedData',
    component: ExportedDataComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['Admin'] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
