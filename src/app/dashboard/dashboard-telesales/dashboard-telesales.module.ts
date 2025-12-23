import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardTelesalesComponent } from './dashboard-telesales.component';
import { DashboardTelesalesRoutingModule } from './dashboard-telesales-routing.module';
import { SharedComponentsModule } from '../../shared/components/shared-components.module';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CallsComponent } from './components/calls/calls.component';
import { FollowUpTeleSalesComponent } from './components/follow-up-tele-sales/follow-up-tele-sales.component';

@NgModule({
  declarations: [
    DashboardTelesalesComponent,
    CallsComponent,
    FollowUpTeleSalesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardTelesalesRoutingModule,
    SharedComponentsModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
})
export class DashboardTelesalesModule {}
