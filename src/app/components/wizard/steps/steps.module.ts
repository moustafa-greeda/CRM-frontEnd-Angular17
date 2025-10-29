import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Base Component
import { BaseStepComponent } from './base-step.component';

// Step Components
import { Step1Component } from './PersonalData/step1.component';
import { Step2Component } from './Address/step2.component';
import { Step3Component } from './socialMedia/step3.component';
import { Step4Component } from './Assignment/step4.component';

@NgModule({
  declarations: [
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
  ],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [Step1Component, Step2Component, Step3Component, Step4Component],
})
export class StepsModule {}
