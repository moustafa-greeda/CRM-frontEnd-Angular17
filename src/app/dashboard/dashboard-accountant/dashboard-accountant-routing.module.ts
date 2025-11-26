import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardAccountantComponent } from './dashboard-accountant.component';
import { InvoiceWorkOrdersComponent } from './components/invoice-work-orders/InvoiceWorkOrders.component';
import { InvoicesComponent } from './components/invoices/invoices.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardAccountantComponent,
  },
  {
    path: 'invoicesWorkOrders',
    component: InvoiceWorkOrdersComponent,
  },
  {
    path: 'invoices',
    component: InvoicesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardAccountRoutingModule {}
