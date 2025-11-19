import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';

// Base Component
import { BaseStepComponent } from './base-step.component';

// Step Components
import { Step1Component } from './PersonalData/step1.component';
import { Step3Component } from './socialMedia/step3.component';
import { CompanyLookupDialogComponent } from './PersonalData/company-lookup-dialog/company-lookup-dialog.component';

@NgModule({
  declarations: [
    Step1Component,
    // Step2Component,
    Step3Component,
    // Step4Component,
    CompanyLookupDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  exports: [Step1Component, Step3Component],
})
export class StepsModule {}
