import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { DashboardAdminComponent } from './dashboard-admin.component';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { TeleSalesComponent } from '../../components/teleSales/teleSales.component';
import { ChartsTeleSalesComponent } from '../../components/teleSales/chart/first-charts.component';
import { SalesComponent } from '../../components/sales/sales.component';
import { ChartsSalesComponent } from '../../components/sales/first-charts/first-charts.component';
import { InvoicesComponent } from '../../components/invoices/invoices.component';
import { InvoiceDialogComponent } from '../../components/invoices/invoice-dialog/invoice-dialog.component';

@NgModule({
  declarations: [
    DashboardAdminComponent,
    TeleSalesComponent,
    ChartsTeleSalesComponent,
    SalesComponent,
    ChartsSalesComponent,
    InvoicesComponent,
    InvoiceDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    SharedComponentsModule,
    CanvasJSAngularChartsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardAdminModule {}
