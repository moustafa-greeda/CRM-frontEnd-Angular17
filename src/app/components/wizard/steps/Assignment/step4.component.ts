import { Component, Input, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { BaseStepComponent } from '../base-step.component';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

/**
 * Step4 Component - Assignment and Task Management
 * This component handles the final step of the wizard for assignment
 * and task management features.
 *
 * Features:
 * - Assignment visibility options (public/private/select person)
 * - Multi-person selection for assignments
 * - Form validation and error handling
 * - Integration with wizard navigation
 */
@Component({
  selector: 'app-step4',
  templateUrl: './step4.component.html',
  styleUrls: [
    './step4.component.css',
    // '../Address/step2.component.css',
    '../shared-styles.css',
  ],
})
export class Step4Component extends BaseStepComponent implements OnInit {
  @Input() override wizardComponent?: any;

  /**
   * Assignment visibility options
   * Controls who can see the assignment
   */
  firstNameOptions = [
    { value: 'public', label: 'عام' }, // Public assignment
    { value: 'private', label: 'خاص' }, // Private assignment
    { value: 'selectPerson', label: 'يختار شخص' }, // Select specific person
  ];

  /**
   * Available people for assignment selection
   * List of team members that can be assigned tasks
   */
  choosePersonOptions = [
    { value: 'مصطفي', label: 'مصطفي' },
    { value: 'محمد', label: 'محمد' },
    { value: 'ادم', label: 'ادم' },
    { value: 'اياد', label: 'اياد' },
    { value: 'محمود', label: 'محمود' },
    { value: 'اسلام', label: 'اسلام' },
    { value: 'احمد', label: 'احمد' },
    { value: 'حسن', label: 'حسن' },
    { value: 'يوسف', label: 'يوسف' },
    { value: 'محمود', label: 'محمود' },
  ];

  /**
   * Array to track selected people for assignment
   * Stores the values of selected team members
   */
  selectedPeople: string[] = [];

  constructor(
    @Inject(ErrorHandlerService) errorHandler: ErrorHandlerService,
    @Inject(FormBuilder) private fb: FormBuilder
  ) {
    super(errorHandler);
    this.initializeForm();
  }

  override ngOnInit(): void {
    // Register this step component with the wizard parent
    if (this.wizardComponent) {
      this.wizardComponent.registerStepComponent(3, this);
    }
  }

  /**
   * Initialize the form with assignment-related fields
   * Sets up form controls for assignment visibility and person selection
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      firstName: [''], // Assignment visibility option
      choosePerson: [[]], // Selected people array
      notes: [''], // Notes field
    });
  }

  /**
   * Check if a specific person is currently selected
   * @param personValue - The value of the person to check
   * @returns boolean indicating if the person is selected
   */
  isPersonSelected(personValue: string): boolean {
    return this.selectedPeople.includes(personValue);
  }

  /**
   * Toggle the selection status of a person
   * Adds the person if not selected, removes if already selected
   * Updates the form control with the new selection
   * @param personValue - The value of the person to toggle
   */
  togglePersonSelection(personValue: string): void {
    const index = this.selectedPeople.indexOf(personValue);
    if (index > -1) {
      // Remove if already selected
      this.selectedPeople.splice(index, 1);
    } else {
      // Add if not selected
      this.selectedPeople.push(personValue);
    }

    // Update form control with new selection
    this.form.get('choosePerson')?.setValue(this.selectedPeople);
    this.onFieldChange('choosePerson');
  }

  /**
   * Get the current form data
   * @returns Object containing all form field values
   */
  getFormData() {
    return this.form.value;
  }

  /**
   * Check if the form is valid
   * @returns boolean indicating form validation status
   */
  isFormValid(): boolean {
    return this.form.valid;
  }

  /**
   * Mark all form fields as touched to trigger validation display
   * This is useful when showing validation errors to the user
   */
  markAllFieldsAsTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsTouched();
    });
  }

  /**
   * Reset the form to its initial state
   * Clears all form field values and resets selected people array
   */
  resetForm(): void {
    this.form.reset();
    this.selectedPeople = [];
  }
}
