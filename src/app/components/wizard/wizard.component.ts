import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css'],
  animations: [
    trigger('slideAnimation', [
      transition('* => *', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-in-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ]),
    trigger('levelCompleteAnimation', [
      transition(':enter', [
        style({ transform: 'scale(0)', opacity: 0 }),
        animate('500ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ])
  ]
})
export class WizardComponent implements OnInit {
  currentStep = 0;
  totalSteps = 12;
  
  // Form groups for each step
  step1Form!: FormGroup;
  step1Form2!: FormGroup; // Second personal form
  step2Form!: FormGroup;
  step3Form!: FormGroup;
  step4Form!: FormGroup;
  step5Form!: FormGroup;
  step6Form!: FormGroup;
  step7Form!: FormGroup;
  step8Form!: FormGroup;
  step9Form!: FormGroup;
  step10Form!: FormGroup;

  // Step titles in Arabic
  stepTitles = [
    'بيانات الأشخاص',
    'بيانات الشركة',
    'بيانات تقنية',
    'السلوك',
    'القدرة الشرائية',
    'نوايا الشراء',
    'البعد النفسي',
    'بيانات المعاملات',
    'الحملات',
    'العلاقات'
  ];

  // Track completed steps
  completedSteps: boolean[] = new Array(this.totalSteps).fill(false);
  
  // Pac-Man animation properties
  pacmanPosition = 0;
  pacmanSound = new Audio('assets/sound/duck.mp3');
  isPacmanMoving = false;
  currentFocusedField = '';
  completedFields: string[] = [];
  
  // Egg tracking properties
  currentFieldIndex = 0;
  fieldStates: { [key: string]: 'pending' | 'in-progress' | 'completed' } = {};
  eggAnimations: { [key: string]: boolean } = {};
  
  // Form field configurations
  formFields = {
    0: ['jobTitle', 'customerLevel', 'personalityType', 'email', 'department', 'language'], // بيانات الأشخاص - Form 1
    1: ['mobileNumber', 'customerType', 'city', 'name', 'birthDate', 'age', 'country'], // بيانات الأشخاص - Form 2
    2: ['address', 'nationality', 'maritalStatus', 'education', 'occupation', 'income'], // بيانات الأشخاص - Form 3
    3: ['companyName', 'sector', 'employeeCount'], // بيانات الشركة
    4: ['devices', 'softwareType', 'techLevel'], // بيانات تقنية
    5: ['consumptionPattern', 'interests', 'dailyActivities'], // السلوك
    6: ['monthlyIncome', 'averageSpending', 'preferredProducts'], // القدرة الشرائية
    7: ['purchaseIntention', 'timeFrame', 'priority'], // نوايا الشراء
    8: ['personality', 'motivation', 'decisionPattern'], // البعد النفسي
    9: ['paymentMethods', 'monthlyTransactions', 'averageTransactionValue'], // بيانات المعاملات
    10: ['previousCampaigns', 'campaignResults', 'budget'], // الحملات
    11: ['partners', 'customers', 'professionalRelations'] // العلاقات
  };

  constructor(private fb: FormBuilder) {
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
      fields.forEach(field => {
        this.fieldStates[`${step}_${field}`] = 'pending';
        this.eggAnimations[`${step}_${field}`] = false;
      });
    }
  }

  initializeForms(): void {
    // Step 1: بيانات الأشخاص - Form 1
    this.step1Form = this.fb.group({
      jobTitle: ['', Validators.required],
      customerLevel: ['', Validators.required],
      personalityType: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      department: ['', Validators.required],
      language: ['', Validators.required]
    });

    // Step 1.5: بيانات الأشخاص - Form 2
    this.step1Form2 = this.fb.group({
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      customerType: ['', Validators.required],
      city: ['', Validators.required],
      name: ['', Validators.required],
      birthDate: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      country: ['', Validators.required]
    });

    // Step 2: بيانات الشركة
    this.step2Form = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      sector: ['', [Validators.required]],
      employeeCount: ['', [Validators.required, Validators.min(1)]]
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
      console.log('جميع البيانات:', allData);
      alert('تم إرسال البيانات بنجاح! تحقق من وحدة التحكم لرؤية البيانات.');
    } else {
      this.markFormGroupTouched(this.getCurrentForm());
    }
  }

  collectAllData(): any {
    return {
      step1: this.step1Form.value,
      step2: this.step2Form.value,
      step3: this.step3Form.value,
      step4: this.step4Form.value,
      step5: this.step5Form.value,
      step6: this.step6Form.value,
      step7: this.step7Form.value,
      step8: this.step8Form.value,
      step9: this.step9Form.value,
      step10: this.step10Form.value
    };
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
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
      case 0: return this.step1Form;
      case 1: return this.step2Form;
      case 2: return this.step3Form;
      case 3: return this.step4Form;
      case 4: return this.step5Form;
      case 5: return this.step6Form;
      case 6: return this.step7Form;
      case 7: return this.step8Form;
      case 8: return this.step9Form;
      case 9: return this.step10Form;
      default: return null;
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.getCurrentForm().get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
      if (control.errors['email']) {
        return 'يرجى إدخال بريد إلكتروني صحيح';
      }
      if (control.errors['minlength']) {
        return `يجب أن يكون ${control.errors['minlength'].requiredLength} أحرف على الأقل`;
      }
      if (control.errors['min']) {
        return `يجب أن تكون القيمة ${control.errors['min'].min} على الأقل`;
      }
      if (control.errors['max']) {
        return `يجب أن تكون القيمة ${control.errors['max'].max} على الأكثر`;
      }
      if (control.errors['pattern']) {
        return 'تنسيق غير صحيح';
      }
    }
    return '';
  }

  // Pac-Man animation methods
  checkFormProgress(): void {
    const form = this.getCurrentForm();
    const fields = this.formFields[this.currentStep as keyof typeof this.formFields];
    
    fields.forEach((field, index) => {
      const fieldKey = `${this.currentStep}_${field}`;
      const control = form.get(field);
      
      if (control?.value && control.valid) {
        if (this.fieldStates[fieldKey] !== 'completed') {
          this.fieldStates[fieldKey] = 'completed';
          // Add to completed fields if not already there
          if (!this.completedFields.includes(fieldKey)) {
            this.completedFields.push(fieldKey);
            this.triggerPacmanMove(fieldKey);
          }
        }
      } else if (control?.value && !control.valid) {
        this.fieldStates[fieldKey] = 'in-progress';
      } else {
        this.fieldStates[fieldKey] = 'pending';
        // Remove from completed fields if invalid
        const index = this.completedFields.indexOf(fieldKey);
        if (index > -1) {
          this.completedFields.splice(index, 1);
        }
      }
    });
  }

  triggerEggAnimation(fieldKey: string, fieldIndex: number): void {
    // Set duck position to current field
    this.currentFieldIndex = fieldIndex;
    
    // Trigger egg cracking animation
    this.eggAnimations[fieldKey] = true;
    
    // Play Pac-Man sound
    this.pacmanSound.play().catch(() => {
      // Ignore audio play errors
    });
    
    // Reset animation after completion
    setTimeout(() => {
      this.eggAnimations[fieldKey] = false;
    }, 2000);
  }

  getFieldState(fieldKey: string): 'pending' | 'in-progress' | 'completed' {
    return this.fieldStates[fieldKey] || 'pending';
  }

  getEggImage(fieldKey: string): string {
    const state = this.getFieldState(fieldKey);
    switch (state) {
      case 'pending':
        return 'assets/egg.png';
      case 'in-progress':
        return 'assets/duck.png';
      case 'completed':
        return 'assets/duckling.png';
      default:
        return 'assets/egg.png';
    }
  }

  isEggAnimating(fieldKey: string): boolean {
    return this.eggAnimations[fieldKey] || false;
  }

  getCurrentFields(): string[] {
    return this.formFields[this.currentStep as keyof typeof this.formFields] || [];
  }

  moveDuck(newPosition: number): void {
    if (this.isPacmanMoving) return;
    
    this.isPacmanMoving = true;
    this.pacmanPosition = newPosition;
    
    // Play Pac-Man sound
    this.pacmanSound.play().catch(() => {
      // Ignore audio play errors
    });
    
    // Reset moving state after animation
    setTimeout(() => {
      this.isPacmanMoving = false;
    }, 1000);
  }

  getDuckStyle(): any {
    return {
      'left': `${this.pacmanPosition}%`,
      'transition': 'left 0.8s ease-in-out'
    };
  }

  // Handle field focus - Pac-Man moves to the focused field
  onFieldFocus(fieldKey: string) {
    this.currentFocusedField = fieldKey;
    this.triggerPacmanMove(fieldKey);
  }

  // Handle field blur
  onFieldBlur() {
    // Keep the duck on the last focused field
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

    // Stop animation after 1 second
    setTimeout(() => {
      this.isPacmanMoving = false;
    }, 1000);
  }

  // Get Pac-Man position based on completed fields
  getPacmanPosition(): number {
    const currentFields = this.getCurrentFields();
    const completedCount = currentFields.filter(field => 
      this.isFieldCompleted(this.currentStep + '_' + field)
    ).length;
    
    if (completedCount === 0) return 5; // Start slightly to the right
    return Math.min((completedCount / currentFields.length) * 90, 90); // Cap at 90% to stay visible
  }

  // Check if a field is completed
  isFieldCompleted(fieldKey: string): boolean {
    return this.completedFields.includes(fieldKey);
  }

  // Check if current level is complete
  isLevelComplete(): boolean {
    const currentFields = this.getCurrentFields();
    return currentFields.every(field => 
      this.isFieldCompleted(this.currentStep + '_' + field)
    );
  }

  // Debug image loading
  onImageError(event: any, type: string) {
    console.error(`Failed to load ${type} image:`, event.target.src);
  }

  onImageLoad(event: any, type: string) {
    console.log(`Successfully loaded ${type} image:`, event.target.src);
  }

  // Save form method
  saveForm() {
    if (this.getCurrentForm().valid) {
      console.log('Form saved:', this.getCurrentForm().value);
      alert('تم حفظ البيانات بنجاح!');
    } else {
      this.markFormGroupTouched(this.getCurrentForm());
      alert('يرجى ملء جميع الحقول المطلوبة');
    }
  }

  // Navigation methods for split personal forms
  nextPersonalForm() {
    if (this.getCurrentForm().valid) {
      this.currentStep = 1; // Go to second personal form
    } else {
      this.markFormGroupTouched(this.getCurrentForm());
    }
  }

  previousPersonalForm() {
    this.currentStep = 0; // Go back to first personal form
  }

  nextPersonalForm2() {
    if (this.getCurrentForm().valid) {
      this.currentStep = 2; // Go to third personal form
    } else {
      this.markFormGroupTouched(this.getCurrentForm());
    }
  }

  previousPersonalForm2() {
    this.currentStep = 1; // Go back to second personal form
  }

  // Override getCurrentForm to handle split forms
  getCurrentForm(): FormGroup {
    if (this.currentStep === 0) {
      return this.step1Form;
    } else if (this.currentStep === 1) {
      return this.step1Form2;
    } else if (this.currentStep === 2) {
      return this.step1Form; // For the third personal form, we'll use step1Form
    }
    
    const forms = [
      this.step1Form, this.step1Form2, this.step1Form, this.step2Form, this.step3Form, this.step4Form, this.step5Form,
      this.step6Form, this.step7Form, this.step8Form, this.step9Form, this.step10Form
    ];
    return forms[this.currentStep];
  }
}
