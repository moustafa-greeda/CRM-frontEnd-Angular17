import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardAdminComponent } from './dashboard-admin.component';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { TeleSalesComponent } from '../../components/teleSales/teleSales.component';
import { ChartsTeleSalesComponent } from '../../components/teleSales/chart/first-charts.component';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { SalesComponent } from '../../components/sales/sales.component';
import { ChartsSalesComponent } from '../../components/sales/first-charts/first-charts.component';

@NgModule({
  declarations: [
    DashboardAdminComponent,
    TeleSalesComponent,
    ChartsTeleSalesComponent,
    SalesComponent,
    ChartsSalesComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedComponentsModule,
    CanvasJSAngularChartsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardAdminModule {}
