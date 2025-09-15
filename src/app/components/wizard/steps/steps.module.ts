import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Base Component
import { BaseStepComponent } from './base-step.component';

// Step Components
import { Step1Component } from './Personal Data 1/step1.component';
import { Step2Component } from './Personal Data 2/step2.component';
import { Step3Component } from './Company Data/step3.component';
import { Step4Component } from './Technical Data/step4.component';
import { Step5Component } from './Behavior/step5.component';
import { Step6Component } from './Purchasing Power/step6.component';
import { Step7Component } from './Purchase Intentions/step7.component';
import { Step8Component } from './Psychographic Dimension/step8.component';
import { Step9Component } from './Transactional Data/step9.component';
import { Step10Component } from './Campaigns/step10.component';
import { Step11Component } from './Relationships/step11.component';

@NgModule({
  declarations: [
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
    Step5Component,
    Step6Component,
    Step7Component,
    Step8Component,
    Step9Component,
    Step10Component,
    Step11Component
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
    Step5Component,
    Step6Component,
    Step7Component,
    Step8Component,
    Step9Component,
    Step10Component,
    Step11Component
  ]
})
export class StepsModule { }
