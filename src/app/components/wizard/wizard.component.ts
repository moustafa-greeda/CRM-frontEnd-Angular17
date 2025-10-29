import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { WizardLeadService, Employee } from './wizard-lead.service';
import { CountryCityService } from '../../core/services/common/country-city.service';
import { JobLevelService } from '../../core/services/common/job-level.service';
import { NotifyDialogService } from '../../shared/notify-dialog-host/notify-dialog.service';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css'],
  animations: [
    trigger('slideAnimation', [
      transition('* => *', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate(
          '300ms ease-in-out',
          style({ transform: 'translateX(0)', opacity: 1 })
        ),
      ]),
    ]),
  ],
})
export class WizardComponent implements OnInit {
  currentStep = 0;
  totalSteps = 4;

  // References to step components
  step1Component?: any;
  step2Component?: any;
  step3Component?: any;
  step4Component?: any;

  // Step titles in Arabic
  stepTitles = [
    'البيانات الشخصية',
    'العنوان',
    'وسائل التواصل الاجتماعي',
    'التخصيص',
  ];
  // Track completed steps
  completedSteps: boolean[] = new Array(this.totalSteps).fill(false);

  // Job levels from service
  jobLevels: any[] = [];

  // Countries and cities from service
  countries: any[] = [];
  cities: any[] = [];

  constructor(
    private fb: FormBuilder,
    private errorHandler: ErrorHandlerService,
    private wizardLeadService: WizardLeadService,
    private countryCityService: CountryCityService,
    private jobLevelService: JobLevelService,
    private notify: NotifyDialogService
  ) {}

  ngOnInit(): void {
    this.loadJobLevels();
    this.loadCountries();
  }

  // Method to register step components
  registerStepComponent(stepIndex: number, component: any): void {
    switch (stepIndex) {
      case 0:
        this.step1Component = component;
        break;
      case 1:
        this.step2Component = component;
        break;
      case 2:
        this.step3Component = component;
        break;
      case 3:
        this.step4Component = component;
        break;
    }
  }

  // Method called when field input changes (for Pac-Man animation)
  onFieldInput(fieldName: string): void {
    // This method can be used for animations or other field-specific logic
  }

  nextStep(): void {
    const currentStepComponent = this.getCurrentStepComponent();

    if (currentStepComponent) {
      if (currentStepComponent.isFormValid()) {
        this.completedSteps[this.currentStep] = true;
        if (this.currentStep < this.totalSteps - 1) {
          this.currentStep++;
        }
      } else {
        currentStepComponent.markAllFieldsAsTouched();
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  submitForm(): void {
    if (this.areAllFormsValid()) {
      const employeeData = this.collectAllData();

      this.wizardLeadService.createEmployee(employeeData).subscribe({
        next: (response) => {
          this.notify.success({
            title: 'تم الحفظ',
            description: 'تم إرسال البيانات بنجاح!',
            autoCloseMs: 3000,
          });
          // Optionally reset forms or navigate to another page
          this.resetAllForms();
        },
        error: (error) => {
          // Show more detailed error message
          let errorMessage =
            'حدث خطأ أثناء إرسال البيانات. يرجى المحاولة مرة أخرى.';
          if (error.error && error.error.errors) {
            errorMessage =
              'خطأ في البيانات: ' + JSON.stringify(error.error.errors);
          } else if (error.error && error.error.message) {
            errorMessage = 'خطأ: ' + error.error.message;
          }

          this.notify.error({
            title: 'خطأ',
            description: errorMessage,
          });
        },
      });
    } else {
      // Mark all forms as touched to show validation errors
      this.forceValidationAllForms();
      this.notify.error({
        title: 'خطأ في الإدخال',
        description: 'يرجى ملء جميع الحقول المطلوبة بشكل صحيح.',
      });
    }
  }

  getCurrentStepComponent(): any {
    switch (this.currentStep) {
      case 0:
        return this.step1Component;
      case 1:
        return this.step2Component;
      case 2:
        return this.step3Component;
      case 3:
        return this.step4Component;
      default:
        return null;
    }
  }

  collectAllData(): Employee {
    const step1Data = this.step1Component?.getFormData() || {};
    const step2Data = this.step2Component?.getFormData() || {};
    const step3Data = this.step3Component?.getFormData() || {};
    const step4Data = this.step4Component?.getFormData() || {};

    // Get countryId and cityId from service
    const countryId = this.getCountryIdFromService(step2Data.country);
    const cityId = this.getCityIdFromService(step2Data.city);
    const jobLevelId = this.getJobLevelId(step1Data.jobLevel);

    const payload: any = {
      name: String(step1Data.firstName || ''),
      jobTitle: String(step1Data.jobTitle || ''),
      email: String(step1Data.email || ''),
      phone: String(step1Data.phone || ''),
      age: Number(step1Data.age) || 0,
      gender: String(step1Data.gender || ''),
      industeryId: Number(step1Data.industry) || 0,
      locationId: countryId, // Using countryId as locationId
      jobLevelLookupId: jobLevelId,
      prefaredLanguage: String(step1Data.language || ''),
      cityId: cityId,
      countryId: countryId,
      postalCode: String(step2Data.postalCode || ''),
      addressLine: String(step2Data.addressLine || ''),
      isHaveSoialMedia: Boolean(step3Data.isHaveSoialMedia),
      socialMediaLink: String(step3Data.socialMediaLink || ''),
      webSiteUrl: String(step3Data.website || step3Data.webSiteUrl || ''), // Use website field from HTML
      notes: String(step4Data.notes || ''),
    };

    // Only include companyId when we have a valid company selected
    const companyValue = step1Data.companyName ?? step2Data.companyName;

    if (companyValue && companyValue !== '') {
      const companyIdNumeric = Number(companyValue);
      if (!isNaN(companyIdNumeric) && companyIdNumeric > 0) {
        payload.companyId = companyIdNumeric;
      }
    }

    return payload;
  }

  // Load job levels from service
  private loadJobLevels(): void {
    this.jobLevelService.getAllJobLevels().subscribe({
      next: (response) => {
        this.jobLevels = response.data || [];
      },
      error: (error) => {
        this.jobLevels = [];
      },
    });
  }

  // Load countries from service
  private loadCountries(): void {
    this.countryCityService.getAllCountries().subscribe({
      next: (response) => {
        this.countries = response.data || [];

        // Update step2 component if it's already registered
        if (this.step2Component && this.step2Component.updateCountries) {
          this.step2Component.updateCountries(this.countries);
        }
      },
      error: (error) => {
        this.countries = [];
      },
    });
  }

  // Load cities by country ID
  loadCitiesByCountryId(countryId: number): void {
    this.countryCityService.getCitiesByCountryId(countryId).subscribe({
      next: (response) => {
        this.cities = response.data || [];

        // Update step2 component with new cities
        if (this.step2Component && this.step2Component.updateCities) {
          this.step2Component.updateCities(this.cities);
        }
      },
      error: (error) => {
        this.cities = [];

        // Clear cities in step2 component
        if (this.step2Component && this.step2Component.updateCities) {
          this.step2Component.updateCities([]);
        }
      },
    });
  }

  // Helper method to get job level ID from service
  private getJobLevelId(jobLevelValue: any): number {
    if (!jobLevelValue) return 0;

    // If it's already a number, return it
    if (typeof jobLevelValue === 'number') {
      return jobLevelValue;
    }

    // If it's a string that can be converted to number, convert it
    const numericValue = Number(jobLevelValue);
    if (!isNaN(numericValue)) {
      return numericValue;
    }

    // If it's a string (job level name), search for it in the loaded job levels
    if (typeof jobLevelValue === 'string') {
      const foundJobLevel = this.jobLevels.find(
        (level) => level.name?.toLowerCase() === jobLevelValue.toLowerCase()
      );
      if (foundJobLevel && foundJobLevel.id) {
        return foundJobLevel.id;
      }
    }

    // Fallback to 0 if not found
    return 0;
  }

  // Helper method to get countryId from service
  private getCountryIdFromService(countryValue: any): number {
    if (!countryValue) return 0;

    // If it's already a number, return it
    if (typeof countryValue === 'number') {
      return countryValue;
    }

    // If it's a string that can be converted to number, convert it
    const numericValue = Number(countryValue);
    if (!isNaN(numericValue)) {
      return numericValue;
    }

    // If it's a string (country name), we would need to search for it
    // For now, return 0 as fallback
    return 0;
  }

  // Helper method to get cityId from service
  private getCityIdFromService(cityValue: any): number {
    if (!cityValue) return 0;

    // If it's already a number, return it
    if (typeof cityValue === 'number') {
      return cityValue;
    }

    // If it's a string that can be converted to number, convert it
    const numericValue = Number(cityValue);
    if (!isNaN(numericValue)) {
      return numericValue;
    }

    // If it's a string (city name), we would need to search for it
    // For now, return 0 as fallback
    return 0;
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    this.errorHandler.markFormGroupTouched(formGroup);
  }

  isCurrentStep(stepIndex: number): boolean {
    return stepIndex === this.currentStep;
  }

  jumpToStep(stepIndex: number): void {
    // Allow jumping to any step that has been completed or is the next step
    if (stepIndex <= this.currentStep || this.isStepValid(stepIndex - 1)) {
      this.currentStep = stepIndex;
    }
  }

  // Progress functionality
  getProgressPercentage(): number {
    return (this.currentStep / (this.totalSteps - 1)) * 100;
  }

  isStepCompleted(stepIndex: number): boolean {
    return this.completedSteps[stepIndex];
  }

  isStepValid(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0:
        return this.step1Component?.isFormValid() || false;
      case 1:
        return this.step2Component?.isFormValid() || false;
      case 2:
        return this.step3Component?.isFormValid() || false;
      case 3:
        return this.step4Component?.isFormValid() || false;
      default:
        return false;
    }
  }

  // Check if all forms are valid
  areAllFormsValid(): boolean {
    const step1Valid = this.step1Component?.isFormValid() || false;
    const step2Valid = this.step2Component?.isFormValid() || false;
    const step3Valid = this.step3Component?.isFormValid() || false;
    const step4Valid = this.step4Component?.isFormValid() || false;

    return step1Valid && step2Valid && step3Valid && step4Valid;
  }

  // Force validation on all forms
  forceValidationAllForms(): void {
    this.step1Component?.markAllFieldsAsTouched();
    this.step2Component?.markAllFieldsAsTouched();
    this.step3Component?.markAllFieldsAsTouched();
    this.step4Component?.markAllFieldsAsTouched();
  }

  // Reset all forms to initial state
  resetAllForms(): void {
    this.step1Component?.resetForm();
    this.step2Component?.resetForm();
    this.step3Component?.resetForm();
    this.step4Component?.resetForm();
    this.currentStep = 0;
    this.completedSteps.fill(false);
  }
}
