import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { PersonalDataTableComponent } from './personal-data-table/personal-data-table.component';
import { CompanyTableComponent } from './company-table/company-table.component';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CompanyService } from './company-table/company.service';
import { SharedTableModule } from './shared/shared-table.module';

@NgModule({
  declarations: [PersonalDataTableComponent, CompanyTableComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatPaginatorModule,
    SharedTableModule,
  ],
  exports: [PersonalDataTableComponent, CompanyTableComponent],
  providers: [CompanyService],
  schemas: [NO_ERRORS_SCHEMA],
})
export class TableComponentsModule {}
