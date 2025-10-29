import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { CompanyWizardComponent } from './company-wizard.component';
import {
  PersonalDataStepComponent,
  AddressStepComponent,
  SocialMediaStepComponent,
  CustomizationStepComponent,
} from './steps';

@NgModule({
  declarations: [
    CompanyWizardComponent,
    PersonalDataStepComponent,
    AddressStepComponent,
    SocialMediaStepComponent,
    CustomizationStepComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [CompanyWizardComponent],
})
export class CompanyWizardModule {}
