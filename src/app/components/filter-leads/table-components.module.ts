import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { PersonalDataTableComponent } from './personal-data-table/personal-data-table.component';
import { CompanyTableComponent } from './company-table/company-table.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    PersonalDataTableComponent,
    CompanyTableComponent
  ],
  imports: [
    MatIconModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  exports: [
    PersonalDataTableComponent,
    CompanyTableComponent
  ]
})
export class TableComponentsModule { }
