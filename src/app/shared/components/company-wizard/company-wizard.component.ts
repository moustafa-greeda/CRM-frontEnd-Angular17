import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface WizardStep {
  id: string;
  title: string;
  component: any;
  isValid: boolean;
}

@Component({
  selector: 'app-company-wizard',
  templateUrl: './company-wizard.component.html',
  styleUrls: ['./company-wizard.component.css'],
})
export class CompanyWizardComponent implements OnInit {
  @Input() initialData?: any;
  @Output() wizardSubmit = new EventEmitter<any>();
  @Output() wizardCancel = new EventEmitter<void>();

  currentStep = 0;
  wizardForm!: FormGroup;

  steps: WizardStep[] = [
    {
      id: 'personal',
      title: 'البيانات الشخصية',
      component: null,
      isValid: false,
    },
    { id: 'address', title: 'العنوان', component: null, isValid: false },
    {
      id: 'social',
      title: 'وسائل التواصل الاجتماعي',
      component: null,
      isValid: false,
    },
    { id: 'customization', title: 'التخصيص', component: null, isValid: false },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.wizardForm = this.fb.group({
      // Personal Data
      companyName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      industry: ['', Validators.required],
      rating: ['', Validators.required],
      responsibleEmployee: ['', Validators.required],
      source: ['', Validators.required],
      notes: [''],

      // Address
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],

      // Social Media
      facebook: [''],
      linkedin: [''],
      twitter: [''],
      instagram: [''],
      snapchat: [''],
      skype: [''],
      whatsapp: [''],
      tiktok: [''],
      website: [''],

      // Customization
      selectedPeople: [[]],
      accessLevel: ['general'],
    });

    if (this.initialData) {
      this.wizardForm.patchValue(this.initialData);
    }
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length - 1) {
      this.validateCurrentStep();
      if (this.steps[this.currentStep].isValid) {
        this.currentStep++;
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  goToStep(stepIndex: number): void {
    this.currentStep = stepIndex;
  }

  private validateCurrentStep(): void {
    const stepId = this.steps[this.currentStep].id;
    let isValid = true;

    switch (stepId) {
      case 'personal':
        isValid =
          (this.wizardForm.get('companyName')?.valid ?? false) &&
          (this.wizardForm.get('email')?.valid ?? false) &&
          (this.wizardForm.get('phoneNumber')?.valid ?? false);
        break;
      case 'address':
        isValid =
          (this.wizardForm.get('address')?.valid ?? false) &&
          (this.wizardForm.get('city')?.valid ?? false) &&
          (this.wizardForm.get('country')?.valid ?? false);
        break;
      case 'social':
        // Social media fields are optional, so always valid
        isValid = true;
        break;
      case 'customization':
        // Customization fields are optional, so always valid
        isValid = true;
        break;
    }

    this.steps[this.currentStep].isValid = isValid;
  }

  onSubmit(): void {
    if (this.wizardForm.valid) {
      this.wizardSubmit.emit(this.wizardForm.value);
    }
  }

  onCancel(): void {
    this.wizardCancel.emit();
  }

  isStepValid(stepIndex: number): boolean {
    return this.steps[stepIndex].isValid;
  }

  canProceedToStep(stepIndex: number): boolean {
    // Can only proceed to next step if current step is valid
    for (let i = 0; i < stepIndex; i++) {
      if (!this.steps[i].isValid) {
        return false;
      }
    }
    return true;
  }
}
