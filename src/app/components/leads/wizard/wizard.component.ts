import {
  Component,
  OnInit,
  AfterViewInit,
  HostListener,
  ElementRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { WizardLeadService, IContact } from './wizard-lead.service';
import { CountryCityService } from '../../../core/services/common/country-city.service';
import { JobLevelService } from '../../../core/services/common/job-level.service';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

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
export class WizardComponent implements OnInit, AfterViewInit {
  currentStep = 0;
  totalSteps = 2;
  private isWizardReady = false;
  private isChangingStep = false;
  private outsideCloseEnabled = true;

  // References to step components
  step1Component?: any;
  step2Component?: any; // Keep for backward compatibility but not used
  step3Component?: any;

  // Step titles in Arabic
  stepTitles = ['البيانات الشخصية والعنوان', 'وسائل التواصل الاجتماعي'];
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
    private notify: NotifyDialogService,
    private elementRef: ElementRef,
    private location: Location,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadJobLevels();
    this.loadCountries();
  }

  ngAfterViewInit(): void {
    // Add a small delay to prevent immediate close when wizard opens
    setTimeout(() => {
      this.isWizardReady = true;
    }, 100);
  }

  // Method to register step components
  registerStepComponent(stepIndex: number, component: any): void {
    switch (stepIndex) {
      case 0:
        this.step1Component = component;
        break;
      case 1:
        this.step3Component = component; // Step2 is merged into step1, so step3 is now step1
        break;
      case 2:
        // Keep for backward compatibility
        this.step2Component = component;
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
      const isValid = currentStepComponent.isFormValid();

      if (isValid) {
        this.completedSteps[this.currentStep] = true;
        if (this.currentStep < this.totalSteps - 1) {
          this.isChangingStep = true;
          this.currentStep++;
          // Reset flag after animation completes
          setTimeout(() => {
            this.isChangingStep = false;
          }, 400);
        }
      } else {
        currentStepComponent.markAllFieldsAsTouched();
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.isChangingStep = true;
      this.currentStep--;
      // Reset flag after animation completes
      setTimeout(() => {
        this.isChangingStep = false;
      }, 400);
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
          });
          // Reset forms before navigation
          this.resetAllForms();
          // Navigate to show-leads page after successful submission
          this.router.navigate(['dashboard/admin/showLeads']);
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
    }
  }

  getCurrentStepComponent(): any {
    switch (this.currentStep) {
      case 0:
        return this.step1Component;
      case 1:
        return this.step3Component;
      default:
        return null;
    }
  }

  collectAllData(): IContact {
    const step1Data = this.step1Component?.getFormData() || {};
    const step2Data = this.step2Component?.getFormData() || {}; // Keep for backward compatibility
    const step3Data = this.step3Component?.getFormData() || {};

    // Get countryId and cityId from service (now from step1Data since step2 is merged)
    const countryId = this.getCountryIdFromService(
      step1Data.country || step2Data.country
    );
    const cityId = this.getCityIdFromService(step1Data.city || step2Data.city);
    const jobLevelId = this.getJobLevelId(step1Data.jobLevel);

    // Get leadSourceLookupId from clientSource field
    const leadSourceLookupId = step1Data.clientSource
      ? Number(step1Data.clientSource)
      : undefined;

    // Ensure addressLine is properly extracted from step1Data (since step2 is merged)
    const addressLineValue =
      step1Data?.addressLine || step2Data?.addressLine
        ? String(step1Data.addressLine || step2Data.addressLine).trim()
      : '';

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
      postalCode: String(step1Data.postalCode || step2Data.postalCode || ''),
      addressLine: addressLineValue, // Use the extracted value
      isHaveSoialMedia: Boolean(step3Data.isHaveSoialMedia),
      socialMediaLink: String(step3Data.socialMediaLink || ''),
      webSiteUrl: String(step3Data.website || step3Data.webSiteUrl || ''), // Use website field from HTML
      notes: String(step1Data.notes || step2Data.notes || ''),
    };

    // Add leadSourceLookupId if available
    if (
      leadSourceLookupId !== undefined &&
      !isNaN(leadSourceLookupId) &&
      leadSourceLookupId > 0
    ) {
      payload.leadSourceLookupId = leadSourceLookupId;
    }

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

        // Update step1 component if it's already registered (step2 is merged into step1)
        if (this.step1Component && this.step1Component.updateCountries) {
          this.step1Component.updateCountries(this.countries);
        }
        // Keep for backward compatibility
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

        // Update step1 component with new cities (step2 is merged into step1)
        if (this.step1Component && this.step1Component.updateCities) {
          this.step1Component.updateCities(this.cities);
        }
        // Keep for backward compatibility
        if (this.step2Component && this.step2Component.updateCities) {
          this.step2Component.updateCities(this.cities);
        }
      },
      error: (error) => {
        this.cities = [];

        // Clear cities in step1 component (step2 is merged into step1)
        if (this.step1Component && this.step1Component.updateCities) {
          this.step1Component.updateCities([]);
        }
        // Keep for backward compatibility
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
      this.isChangingStep = true;
      this.currentStep = stepIndex;
      // Reset flag after animation completes
      setTimeout(() => {
        this.isChangingStep = false;
      }, 400);
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
        return this.step3Component?.isFormValid() || false;
      default:
        return false;
    }
  }

  // Check if all forms are valid
  areAllFormsValid(): boolean {
    const step1Valid = this.step1Component?.isFormValid() || false;
    const step3Valid = this.step3Component?.isFormValid() || false;

    return step1Valid && step3Valid;
  }

  // Force validation on all forms
  forceValidationAllForms(): void {
    this.step1Component?.markAllFieldsAsTouched();
    this.step3Component?.markAllFieldsAsTouched();
  }

  // Reset all forms to initial state
  resetAllForms(): void {
    this.step1Component?.resetForm();
    this.step3Component?.resetForm();
    this.currentStep = 0;
    this.completedSteps.fill(false);
  }

  // Close wizard
  onCancel(): void {
    // Navigate back or close wizard
    this.location.back();
  }

  setOutsideCloseEnabled(enabled: boolean): void {
    this.outsideCloseEnabled = enabled;
  }

  // Close wizard when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Only handle if wizard is ready, not changing steps, and outside closing enabled
    if (
      !this.isWizardReady ||
      this.isChangingStep ||
      !this.outsideCloseEnabled
    ) {
      return;
    }

    const target = event.target as HTMLElement;

    // Check if click is inside the entire wizard component
    const clickedInside = this.elementRef.nativeElement.contains(target);

    // If clicked inside, don't close
    if (clickedInside) {
      return;
    }

    // Additional check: make sure we're not clicking on elements that might be outside
    // but are part of the wizard (like modals, dropdowns, etc.)
    const isWizardElement =
      target.closest('.wizard-wrapper') ||
      target.closest('.wizard-container') ||
      target.closest('.parentwizard') ||
      target.closest('.wizard-form') ||
      target.closest('.form-container') ||
      target.closest('.cdk-overlay-pane') ||
      target.closest('.mat-mdc-dialog-container');

    if (isWizardElement) {
      return;
    }

    // Only close if truly outside the wizard
    this.onCancel();
  }
}
