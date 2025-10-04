import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';

import { FilterLeadsComponent } from './filter-leads.component';
import { TableComponentsModule } from './table-components.module';
import { CompanyService } from './company-table/company.service';
import { SharedTableModule } from './shared/shared-table.module';

@NgModule({
  declarations: [FilterLeadsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatPaginatorModule,
    MatDialogModule,
    TableComponentsModule,
    SharedTableModule,
  ],
  exports: [FilterLeadsComponent],
  providers: [CompanyService],
  schemas: [NO_ERRORS_SCHEMA],
})
export class FilterLeadsModule {}
