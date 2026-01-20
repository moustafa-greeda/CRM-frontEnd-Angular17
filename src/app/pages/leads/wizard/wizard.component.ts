import {
  Component,
  OnInit,
  AfterViewInit,
  HostListener,
  ElementRef,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { WizardLeadService } from './wizard-lead.service';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';
import { Location } from '@angular/common';
import { IContact } from '../../../core/Models/leads/IContact';
import { WizardDataService } from './services/wizard-data.service';
import { StepsModule } from './steps/steps.module';

@Component({
  selector: 'app-wizard',
  standalone: true,
  imports: [CommonModule, StepsModule],
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css'],
  // ⚡ تحسين الأداء - Change Detection على الـ Signals فقط
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  // ========== State Signals ==========
  currentStep = signal<number>(0);
  readonly totalSteps = 2;
  private isWizardReady = signal<boolean>(false);
  private isChangingStep = signal<boolean>(false);
  private isSubmitting = signal<boolean>(false);
  private outsideCloseEnabled = signal<boolean>(false);

  // ========== Loading State Signals ==========
  private _isLoadingInitialData = signal<boolean>(false);
  private _isLoadingCities = signal<boolean>(false);
  readonly isLoading = signal<boolean>(false);

  // References to step components (using signals for reactivity)
  personalDataStepComponent = signal<any | undefined>(undefined); // Step 0: Personal Data and Address
  socialMediaStepComponent = signal<any | undefined>(undefined); // Step 1: Social Media

  // Step titles in Arabic
  readonly stepTitles = [
    'البيانات الشخصية والعنوان',
    'وسائل التواصل الاجتماعي',
  ];

  // Track completed steps
  completedSteps = signal<boolean[]>(new Array(this.totalSteps).fill(false));

  // ========== Computed Signals ==========
  readonly jobLevels = this.dataService.jobLevels$;
  readonly countries = this.dataService.countries$;
  readonly cities = this.dataService.cities$;

  readonly progressPercentage = computed(() => {
    return (this.currentStep() / (this.totalSteps - 1)) * 100;
  });

  readonly canGoPrevious = computed(() => this.currentStep() > 0);

  readonly isLastStep = computed(
    () => this.currentStep() === this.totalSteps - 1
  );

  readonly isFirstStep = computed(() => this.currentStep() === 0);

  // ========== Loading Computed Signals ==========
  readonly isLoadingInitialData = computed(() => this._isLoadingInitialData());
  readonly isLoadingCities = computed(() => this._isLoadingCities());
  readonly isSubmittingForm = computed(() => this.isSubmitting());
  readonly isLoadingAny = computed(
    () =>
      this._isLoadingInitialData() ||
      this._isLoadingCities() ||
      this.isSubmitting() ||
      this.isLoading()
  );

  constructor(
    private errorHandler: ErrorHandlerService,
    private wizardLeadService: WizardLeadService,
    private notify: NotifyDialogService,
    private elementRef: ElementRef,
    private location: Location,
    private dataService: WizardDataService
  ) {}

  ngOnInit(): void {
    this._isLoadingInitialData.set(true);
    this.isLoading.set(true);

    this.dataService.loadJobLevels().subscribe({
      next: () => {
        // Job levels loaded
      },
      error: () => {
        this._isLoadingInitialData.set(false);
        this.isLoading.set(false);
      },
    });

    this.dataService.loadCountries().subscribe({
      next: (countries) => {
        // Update personal data step component if it's already registered
        const component = this.personalDataStepComponent();
        if (component && component.updateCountries) {
          component.updateCountries(countries);
        }
        this._isLoadingInitialData.set(false);
        this.isLoading.set(false);
      },
      error: () => {
        this._isLoadingInitialData.set(false);
        this.isLoading.set(false);
      },
    });
  }

  ngAfterViewInit(): void {
    // Add a small delay to prevent immediate close when wizard opens
    setTimeout(() => {
      this.isWizardReady.set(true);
    }, 100);
  }

  // Method to register step components
  registerStepComponent(stepIndex: number, component: any): void {
    switch (stepIndex) {
      case 0:
        this.personalDataStepComponent.set(component);
        break;
      case 1:
        this.socialMediaStepComponent.set(component);
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
        const completed = [...this.completedSteps()];
        completed[this.currentStep()] = true;
        this.completedSteps.set(completed);

        if (this.currentStep() < this.totalSteps - 1) {
          this.isChangingStep.set(true);
          this.currentStep.update((step) => step + 1);
          // Reset flag after animation completes
          setTimeout(() => {
            this.isChangingStep.set(false);
          }, 400);
        }
      } else {
        currentStepComponent.markAllFieldsAsTouched();
      }
    }
  }

  previousStep(): void {
    if (this.currentStep() > 0) {
      this.isChangingStep.set(true);
      this.currentStep.update((step) => step - 1);
      // Reset flag after animation completes
      setTimeout(() => {
        this.isChangingStep.set(false);
      }, 400);
    }
  }

  submitForm(): void {
    if (this.areAllFormsValid()) {
      const employeeData = this.collectAllData();

      this.isSubmitting.set(true);
      this.isLoading.set(true);
      this.setOutsideCloseEnabled(false);

      this.wizardLeadService.createContact(employeeData).subscribe({
        next: (response) => {
          this.isSubmitting.set(false);
          this.isLoading.set(false);
          this.notify.success({
            title: 'تم الحفظ',
            description: 'تم إرسال البيانات بنجاح!',
          });
          // Reset forms before navigation
          this.resetAllForms();
        },
        error: (error) => {
          this.isSubmitting.set(false);
          this.isLoading.set(false);
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
    switch (this.currentStep()) {
      case 0:
        return this.personalDataStepComponent();
      case 1:
        return this.socialMediaStepComponent();
      default:
        return null;
    }
  }

  collectAllData(): IContact {
    const personalData = this.personalDataStepComponent()?.getFormData() || {};
    const socialMediaData =
      this.socialMediaStepComponent()?.getFormData() || {};

    // Get countryId and cityId from service
    const countryId = this.dataService.getCountryIdFromService(
      personalData.country
    );
    const cityId = this.dataService.getCityIdFromService(personalData.city);
    const jobLevelId = this.dataService.getJobLevelId(personalData.jobLevel);

    // Get leadSourceLookupId from clientSource field
    const leadSourceLookupId = personalData.clientSource
      ? Number(personalData.clientSource)
      : undefined;

    // Ensure addressLine is properly extracted from personalData
    const addressLineValue = personalData?.addressLine
      ? String(personalData.addressLine).trim()
      : '';

    const payload: any = {
      name: String(personalData.firstName || ''),
      jobTitle: String(personalData.jobTitle || ''),
      email: String(personalData.email || ''),
      phone: String(personalData.phone || ''),
      age: Number(personalData.age) || 0,
      gender: String(personalData.gender || ''),
      industeryId: Number(personalData.industry) || 0,
      locationId: countryId, // Using countryId as locationId
      jobLevelLookupId: jobLevelId,
      prefaredLanguage: String(personalData.language || ''),
      cityId: cityId,
      countryId: countryId,
      postalCode: String(personalData.postalCode || ''),
      addressLine: addressLineValue,
      isHaveSoialMedia: Boolean(socialMediaData.isHaveSoialMedia),
      socialMediaLink: String(socialMediaData.socialMediaLink || ''),
      webSiteUrl: String(
        socialMediaData.website || socialMediaData.webSiteUrl || ''
      ),
      notes: String(personalData.notes || ''),
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
    const companyValue = personalData.companyName;

    if (companyValue && companyValue !== '') {
      const companyIdNumeric = Number(companyValue);
      if (!isNaN(companyIdNumeric) && companyIdNumeric > 0) {
        payload.companyId = companyIdNumeric;
      }
    }

    return payload;
  }

  // Load cities by country ID
  loadCitiesByCountryId(countryId: number): void {
    this._isLoadingCities.set(true);
    this.dataService.loadCitiesByCountryId(countryId).subscribe({
      next: (cities) => {
        // Update personal data step component with new cities
        const component = this.personalDataStepComponent();
        if (component && component.updateCities) {
          component.updateCities(cities);
        }
        this._isLoadingCities.set(false);
      },
      error: () => {
        // Clear cities in personal data step component
        const component = this.personalDataStepComponent();
        if (component && component.updateCities) {
          component.updateCities([]);
        }
        this._isLoadingCities.set(false);
      },
    });
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    this.errorHandler.markFormGroupTouched(formGroup);
  }

  isCurrentStep(stepIndex: number): boolean {
    return stepIndex === this.currentStep();
  }

  jumpToStep(stepIndex: number): void {
    // Allow jumping to any step that has been completed or is the next step
    if (stepIndex <= this.currentStep() || this.isStepValid(stepIndex - 1)) {
      this.isChangingStep.set(true);
      this.currentStep.set(stepIndex);
      // Reset flag after animation completes
      setTimeout(() => {
        this.isChangingStep.set(false);
      }, 400);
    }
  }

  // Progress functionality
  getProgressPercentage(): number {
    return this.progressPercentage();
  }

  isStepCompleted(stepIndex: number): boolean {
    return this.completedSteps()[stepIndex];
  }

  isStepValid(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0:
        return this.personalDataStepComponent()?.isFormValid() || false;
      case 1:
        return this.socialMediaStepComponent()?.isFormValid() || false;
      default:
        return false;
    }
  }

  // Check if all forms are valid
  areAllFormsValid(): boolean {
    const personalDataValid =
      this.personalDataStepComponent()?.isFormValid() || false;
    const socialMediaValid =
      this.socialMediaStepComponent()?.isFormValid() || false;

    return personalDataValid && socialMediaValid;
  }

  // Force validation on all forms
  forceValidationAllForms(): void {
    this.personalDataStepComponent()?.markAllFieldsAsTouched();
    this.socialMediaStepComponent()?.markAllFieldsAsTouched();
  }

  // Reset all forms to initial state
  resetAllForms(): void {
    this.personalDataStepComponent()?.resetForm();
    this.socialMediaStepComponent()?.resetForm();
    this.currentStep.set(0);
    this.completedSteps.set(new Array(this.totalSteps).fill(false));
  }

  // Close wizard
  onCancel(): void {
    // Navigate back or close wizard
    this.location.back();
  }

  setOutsideCloseEnabled(enabled: boolean): void {
    this.outsideCloseEnabled.set(enabled);
  }

  // Close wizard when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Only handle if wizard is ready, not changing steps, and outside closing enabled
    if (
      !this.isWizardReady() ||
      this.isChangingStep() ||
      !this.outsideCloseEnabled() ||
      this.isSubmitting()
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
