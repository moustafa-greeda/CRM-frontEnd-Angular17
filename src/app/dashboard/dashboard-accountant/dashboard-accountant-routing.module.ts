import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardAccountantComponent } from './dashboard-accountant.component';
import { InvoiceWorkOrdersComponent } from './components/invoice-work-orders/InvoiceWorkOrders.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardAccountantComponent,
  },
  {
    path: 'invoices',
    component: InvoiceWorkOrdersComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardAccountRoutingModule {}
