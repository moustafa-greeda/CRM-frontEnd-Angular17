import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardAccountantComponent } from './dashboard-accountant.component';
import { InvoiceWorkOrdersComponent } from './components/invoice-work-orders/InvoiceWorkOrders.component';
import { InvoicesComponent } from './components/invoices/invoices.component';
import { PaymentsComponent } from './components/payments/payments.component';
import { ExpensesComponent } from './components/expenses/expenses.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardAccountantComponent,
    data: { roles: ['Accountant'] },
  },
  {
    path: 'invoicesWorkOrders',
    component: InvoiceWorkOrdersComponent,
    data: { roles: ['Accountant'] },
  },
  {
    path: 'invoices',
    component: InvoicesComponent,
    data: { roles: ['Accountant'] },
  },
  {
    path: 'payments',
    component: PaymentsComponent,
    data: { roles: ['Accountant'] },
  },
  {
    path: 'expenses',
    component: ExpensesComponent,
    data: { roles: ['Accountant'] },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardAccountRoutingModule {}
