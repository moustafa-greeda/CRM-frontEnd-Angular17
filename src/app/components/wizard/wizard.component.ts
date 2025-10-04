import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

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
    trigger('levelCompleteAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0)', opacity: 0 }),
        animate('500ms ease-out', style({ transform: 'scale(1)', opacity: 1 })),
      ]),
    ]),
  ],
})
export class WizardComponent implements OnInit {
  currentStep = 0;
  totalSteps = 11;

  // Form groups for each step
  step1Form!: FormGroup;
  step1Form2!: FormGroup; // Second personal form
  step3Form!: FormGroup; // Company data form
  step4Form!: FormGroup;
  step5Form!: FormGroup;
  step6Form!: FormGroup;
  step7Form!: FormGroup;
  step8Form!: FormGroup;
  step9Form!: FormGroup;
  step10Form!: FormGroup;
  step11Form!: FormGroup;

  // Step titles in Arabic
  stepTitles = [
    'بيانات الأشخاص 1',
    'بيانات الأشخاص 2',
    'بيانات الشركة',
    'بيانات تقنية',
    'السلوك',
    'القدرة الشرائية',
    'نوايا الشراء',
    'البعد النفسي',
    'بيانات المعاملات',
    'الحملات',
    'العلاقات',
  ];

  // Track completed steps
  completedSteps: boolean[] = new Array(this.totalSteps).fill(false);

  // Pac-Man animation properties
  pacmanPosition = 0;
  pacmanSound = new Audio('assets/sound/duck.mp3');
  isPacmanMoving = false;
  currentFocusedField = '';
  completedFields: string[] = [];

  // Field tracking properties
  fieldStates: { [key: string]: 'pending' | 'in-progress' | 'completed' } = {};

  // Form field configurations
  formFields = {
    0: [
      'jobTitle',
      'customerLevel',
      'personalityType',
      'email',
      'department',
      'language',
    ], // بيانات الأشخاص - Form 1
    1: [
      'mobileNumber',
      'customerType',
      'city',
      'name',
      'birthDate',
      'age',
      'country',
    ], // بيانات الأشخاص - Form 2
    2: [
      'companyName',
      'industry',
      'companyStage',
      'companySize',
      'location',
      'digitalTransformation',
      'ownership',
      'branches',
    ], // بيانات الشركة
    3: ['cloudProvider', 'companyName', 'techSpending', 'saasTools'], // بيانات تقنية
    4: ['consumptionPattern', 'interests', 'dailyActivities'], // السلوك
    5: ['monthlyIncome', 'averageSpending', 'preferredProducts'], // القدرة الشرائية
    6: ['purchaseIntention', 'timeFrame', 'priority'], // نوايا الشراء
    7: ['personality', 'motivation', 'decisionPattern'], // البعد النفسي
    8: ['paymentMethods', 'monthlyTransactions', 'averageTransactionValue'], // بيانات المعاملات
    9: ['previousCampaigns', 'campaignResults', 'budget'], // الحملات
    10: ['partners', 'customers', 'professionalRelations'], // العلاقات
  };

  constructor(
    private fb: FormBuilder,
    private errorHandler: ErrorHandlerService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    // Listen to form changes to trigger egg animations
    this.setupFormListeners();
  }

  setupFormListeners(): void {
    // Listen to all form changes
    for (let i = 0; i < this.totalSteps; i++) {
      const form = this.getFormByStep(i);
      if (form) {
        form.valueChanges.subscribe(() => {
          this.checkFormProgress();
        });
      }
    }
  }

  initializeFieldStates(): void {
    // Initialize field states for all forms
    for (let step = 0; step < this.totalSteps; step++) {
      const fields = this.formFields[step as keyof typeof this.formFields];
      fields.forEach((field) => {
        this.fieldStates[`${step}_${field}`] = 'pending';
      });
    }
  }

  initializeForms(): void {
    // Step 1: بيانات الأشخاص - Form 1
    this.step1Form = this.fb.group({
      jobTitle: [''],
      customerLevel: [''],
      personalityType: [''],
      email: ['', Validators.email],
      department: [''],
      language: [''],
    });

    // Step 1.5: بيانات الأشخاص - Form 2
    this.step1Form2 = this.fb.group({
      mobileNumber: ['', Validators.pattern(/^[0-9]+$/)],
      customerType: [''],
      city: [''],
      name: [''],
      birthDate: [''],
      age: ['', [Validators.min(1), Validators.max(120)]],
      country: [''],
    });

    // Step 2: بيانات الشركة
    this.step3Form = this.fb.group({
      companyName: ['', Validators.minLength(2)],
      industry: [''],
      companyStage: [''],
      companySize: [''],
      location: [''],
      digitalTransformation: [''],
      ownership: [''],
      branches: [''],
    });

    // Step 3: بيانات تقنية
    this.step4Form = this.fb.group({
      cloudProvider: [''],
      companyName: ['', Validators.minLength(2)],
      techSpending: [''],
      saasTools: [''],
    });

    // Step 4: السلوك
    this.step5Form = this.fb.group({
      consumptionPattern: [''],
      sports: [false],
      technology: [false],
      travel: [false],
      music: [false],
      reading: [false],
      gaming: [false],
      dailyActivities: ['', Validators.minLength(20)],
    });

    // Step 5: القدرة الشرائية
    this.step6Form = this.fb.group({
      monthlyIncome: [''],
      averageSpending: [''],
      preferredProducts: ['', Validators.minLength(10)],
    });

    // Step 6: نوايا الشراء
    this.step7Form = this.fb.group({
      purchaseIntention: [''],
      timeFrame: [''],
      priority: [''],
    });

    // Step 7: البعد النفسي
    this.step8Form = this.fb.group({
      personality: [''],
      motivation: [''],
      decisionPattern: [''],
    });

    // Step 8: بيانات المعاملات
    this.step9Form = this.fb.group({
      cash: [false],
      credit_card: [false],
      debit_card: [false],
      bank_transfer: [false],
      digital_wallet: [false],
      monthlyTransactions: [''],
      averageTransactionValue: [''],
    });

    // Step 9: الحملات
    this.step10Form = this.fb.group({
      previousCampaigns: [''],
      campaignResults: [''],
      budget: [''],
    });

    // Step 10: العلاقات
    this.step11Form = this.fb.group({
      partners: [''],
      customers: [''],
      professionalRelations: [''],
    });

    // Initialize field states for all forms
    this.initializeFieldStates();
  }

  nextStep(): void {
    if (this.getCurrentForm().valid) {
      if (this.currentStep < this.totalSteps - 1) {
        this.currentStep++;
      }
    } else {
      this.markFormGroupTouched(this.getCurrentForm());
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  submitForm(): void {
    if (this.getCurrentForm().valid) {
      const allData = this.collectAllData();
      alert('تم إرسال البيانات بنجاح! تحقق من وحدة التحكم لرؤية البيانات.');
    } else {
      this.markFormGroupTouched(this.getCurrentForm());
    }
  }

  collectAllData(): any {
    return {
      step1: this.step1Form.value,
      step2: this.step1Form2.value,
      step3: this.step3Form.value,
      step4: this.step4Form.value,
      step5: this.step5Form.value,
      step6: this.step6Form.value,
      step7: this.step7Form.value,
      step8: this.step8Form.value,
      step9: this.step9Form.value,
      step10: this.step10Form.value,
      step11: this.step11Form.value,
    };
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
    const form = this.getFormByStep(stepIndex);
    return form ? form.valid : false;
  }

  private getFormByStep(stepIndex: number): FormGroup | null {
    switch (stepIndex) {
      case 0:
        return this.step1Form;
      case 1:
        return this.step1Form2;
      case 2:
        return this.step3Form;
      case 3:
        return this.step4Form;
      case 4:
        return this.step5Form;
      case 5:
        return this.step6Form;
      case 6:
        return this.step7Form;
      case 7:
        return this.step8Form;
      case 8:
        return this.step9Form;
      case 9:
        return this.step10Form;
      case 10:
        return this.step11Form;
      default:
        return null;
    }
  }

  // Global Error Message Handler for Wizard
  getErrorMessage(controlName: string): string {
    return this.errorHandler.getErrorMessage(
      controlName,
      this.getCurrentForm()
    );
  }

  // Centralized Error Message Handler
  handleFieldError(controlName: string, form: FormGroup): string {
    return this.errorHandler.handleFieldError(controlName, form);
  }

  // Check if field has error
  hasFieldError(controlName: string, form?: FormGroup): boolean {
    const targetForm = form || this.getCurrentForm();
    return this.errorHandler.hasFieldError(controlName, targetForm);
  }

  // Get all errors for current form
  getAllFormErrors(): { [key: string]: string } {
    return this.errorHandler.getAllFormErrors(this.getCurrentForm());
  }

  // Check if current form has any errors
  hasFormErrors(): boolean {
    return this.errorHandler.hasFormErrors(this.getCurrentForm());
  }

  // Clear all errors for a specific field
  clearFieldError(controlName: string, form?: FormGroup): void {
    const targetForm = form || this.getCurrentForm();
    this.errorHandler.clearFieldError(controlName, targetForm);
  }

  // Clear all errors for current form
  clearAllFormErrors(): void {
    this.errorHandler.clearAllFormErrors(this.getCurrentForm());
  }

  // Mark field as touched and dirty to trigger validation
  markFieldAsTouched(controlName: string, form?: FormGroup): void {
    const targetForm = form || this.getCurrentForm();
    this.errorHandler.markFieldAsTouched(controlName, targetForm);
  }

  // Validate current form and return validation status
  validateCurrentForm(): {
    isValid: boolean;
    errors: { [key: string]: string };
  } {
    return this.errorHandler.validateCurrentForm(this.getCurrentForm());
  }

  // Validate specific form by step index
  validateFormByStep(stepIndex: number): {
    isValid: boolean;
    errors: { [key: string]: string };
  } {
    const form = this.getFormByStep(stepIndex);
    if (!form) {
      return { isValid: false, errors: {} };
    }
    return this.errorHandler.validateCurrentForm(form);
  }

  // Get validation summary for all forms
  getValidationSummary(): {
    [stepIndex: number]: {
      isValid: boolean;
      errors: { [key: string]: string };
    };
  } {
    const summary: {
      [stepIndex: number]: {
        isValid: boolean;
        errors: { [key: string]: string };
      };
    } = {};

    for (let i = 0; i < this.totalSteps; i++) {
      summary[i] = this.validateFormByStep(i);
    }

    return summary;
  }

  // Check if all forms are valid
  areAllFormsValid(): boolean {
    for (let i = 0; i < this.totalSteps; i++) {
      const validation = this.validateFormByStep(i);
      if (!validation.isValid) {
        return false;
      }
    }
    return true;
  }

  // Force validation on current form
  forceValidationCurrentForm(): void {
    this.errorHandler.forceValidationCurrentForm(this.getCurrentForm());
  }

  // Force validation on all forms
  forceValidationAllForms(): void {
    for (let i = 0; i < this.totalSteps; i++) {
      const form = this.getFormByStep(i);
      if (form) {
        this.errorHandler.forceValidationCurrentForm(form);
      }
    }
  }

  // Pac-Man animation methods
  checkFormProgress(): void {
    const form = this.getCurrentForm();
    const fields =
      this.formFields[this.currentStep as keyof typeof this.formFields];
    let hasNewSequentialCompletion = false;

    // Check fields in order from left to right
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const fieldKey = `${this.currentStep}_${field}`;
      const control = form.get(field);

      if (control?.value && control.valid) {
        if (this.fieldStates[fieldKey] !== 'completed') {
          this.fieldStates[fieldKey] = 'completed';
          // Add to completed fields if not already there
          if (!this.completedFields.includes(fieldKey)) {
            this.completedFields.push(fieldKey);
            hasNewSequentialCompletion = true;
          }
        }
      } else if (control?.value && !control.valid) {
        this.fieldStates[fieldKey] = 'in-progress';
      } else {
        this.fieldStates[fieldKey] = 'pending';
        // Remove from completed fields if invalid
        const fieldIndex = this.completedFields.indexOf(fieldKey);
        if (fieldIndex > -1) {
          this.completedFields.splice(fieldIndex, 1);
        }
      }
    }

    // Trigger Pac-Man movement only if a sequential field was completed
    if (hasNewSequentialCompletion) {
      this.triggerPacmanMove('sequential_field');
    }
  }

  getFieldState(fieldKey: string): 'pending' | 'in-progress' | 'completed' {
    return this.fieldStates[fieldKey] || 'pending';
  }

  getCurrentFields(): string[] {
    return (
      this.formFields[this.currentStep as keyof typeof this.formFields] || []
    );
  }

  // Handle field focus - Pac-Man moves to the focused field
  onFieldFocus(fieldKey: string) {
    this.currentFocusedField = fieldKey;
    // Don't trigger movement on focus, only on completion
  }

  // Handle field input - trigger movement for any field completion
  onFieldInput(fieldKey: string) {
    const form = this.getCurrentForm();
    const control = form.get(fieldKey);

    if (control?.value && control.valid) {
      const fullFieldKey = `${this.currentStep}_${fieldKey}`;
      const currentFormFields = this.getCurrentFields();
      const fieldIndex = currentFormFields.indexOf(fieldKey);

      // Allow completion of any field without order restriction
      if (!this.completedFields.includes(fullFieldKey)) {
        this.completedFields.push(fullFieldKey);
        this.fieldStates[fullFieldKey] = 'completed';
        this.triggerPacmanMove(fieldKey);
      }
    }
  }

  // Check if a field is currently focused
  isCurrentField(fieldKey: string): boolean {
    return this.currentFocusedField === fieldKey;
  }

  // Trigger Pac-Man movement animation
  triggerPacmanMove(fieldKey: string) {
    this.isPacmanMoving = true;

    // Play Pac-Man sound
    this.pacmanSound.play().catch(() => {
      // Ignore audio play errors
    });

    // Calculate new position based on current progress
    const newPosition = this.getPacmanPosition();

    // Stop animation after 1 second
    setTimeout(() => {
      this.isPacmanMoving = false;
    }, 1000);
  }

  // Get Pac-Man position based on any field completion (left to right)
  getPacmanPosition(): number {
    const currentFields = this.getCurrentFields();
    const completedCount = currentFields.filter((field) =>
      this.isFieldCompleted(this.currentStep + '_' + field)
    ).length;

    // Calculate position from left to right
    const position =
      completedCount === 0
        ? 5
        : Math.min((completedCount / currentFields.length) * 90, 90);
    return position;
  }

  // Progress calculation methods for different trackers
  getBuildingProgress(): number {
    const currentFields = this.getCurrentFields();
    const completedCount = currentFields.filter((field) =>
      this.isFieldCompleted(this.currentStep + '_' + field)
    ).length;
    return (completedCount / currentFields.length) * 100;
  }

  getCircuitProgress(): number {
    const currentFields = this.getCurrentFields();
    const completedCount = currentFields.filter((field) =>
      this.isFieldCompleted(this.currentStep + '_' + field)
    ).length;
    return (completedCount / currentFields.length) * 100;
  }

  getHeartbeatProgress(): number {
    const currentFields = this.getCurrentFields();
    const completedCount = currentFields.filter((field) =>
      this.isFieldCompleted(this.currentStep + '_' + field)
    ).length;
    return (completedCount / currentFields.length) * 100;
  }

  getMoneyProgress(): number {
    const currentFields = this.getCurrentFields();
    const completedCount = currentFields.filter((field) =>
      this.isFieldCompleted(this.currentStep + '_' + field)
    ).length;
    return (completedCount / currentFields.length) * 100;
  }

  getShoppingProgress(): number {
    const currentFields = this.getCurrentFields();
    const completedCount = currentFields.filter((field) =>
      this.isFieldCompleted(this.currentStep + '_' + field)
    ).length;
    return (completedCount / currentFields.length) * 100;
  }

  getBrainProgress(): number {
    const currentFields = this.getCurrentFields();
    const completedCount = currentFields.filter((field) =>
      this.isFieldCompleted(this.currentStep + '_' + field)
    ).length;
    return (completedCount / currentFields.length) * 100;
  }

  getDatabaseProgress(): number {
    const currentFields = this.getCurrentFields();
    const completedCount = currentFields.filter((field) =>
      this.isFieldCompleted(this.currentStep + '_' + field)
    ).length;
    return (completedCount / currentFields.length) * 100;
  }

  getRocketProgress(): number {
    const currentFields = this.getCurrentFields();
    const completedCount = currentFields.filter((field) =>
      this.isFieldCompleted(this.currentStep + '_' + field)
    ).length;
    return (completedCount / currentFields.length) * 100;
  }

  getNetworkProgress(): number {
    const currentFields = this.getCurrentFields();
    const completedCount = currentFields.filter((field) =>
      this.isFieldCompleted(this.currentStep + '_' + field)
    ).length;
    return (completedCount / currentFields.length) * 100;
  }

  // Check if a field is completed
  isFieldCompleted(fieldKey: string): boolean {
    return this.completedFields.includes(fieldKey);
  }

  // Check if a field is available for completion (any field can be completed)
  isFieldAvailableForCompletion(fieldIndex: number): boolean {
    // All fields are always available for completion
    return true;
  }

  // Check if current level is complete
  isLevelComplete(): boolean {
    const currentFields = this.getCurrentFields();
    return currentFields.every((field) =>
      this.isFieldCompleted(this.currentStep + '_' + field)
    );
  }

  // Debug image loading
  onImageError(event: any, type: string) {
    console.error(`Failed to load ${type} image:`, event.target.src);
  }

  onImageLoad(event: any, type: string) {}

  // Override getCurrentForm to handle split forms
  getCurrentForm(): FormGroup {
    if (this.currentStep === 0) {
      return this.step1Form;
    } else if (this.currentStep === 1) {
      return this.step1Form2;
    }

    const forms = [
      this.step1Form,
      this.step1Form2,
      this.step3Form,
      this.step4Form,
      this.step5Form,
      this.step6Form,
      this.step7Form,
      this.step8Form,
      this.step9Form,
      this.step10Form,
      this.step11Form,
    ];
    return forms[this.currentStep];
  }
}
