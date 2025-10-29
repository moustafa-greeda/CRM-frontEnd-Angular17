import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BaseStepComponent } from '../base-step.component';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

/**
 * Step3 Component - Social Media Information
 * This component handles the collection of social media and additional information
 * for the customer/employee wizard form.
 *
 * Features:
 * - Social media platform links collection
 * - Website URL input
 * - Additional notes field
 * - Form validation and error handling
 */
@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
  styleUrls: [
    './step3.component.css',
    '../Address/step2.component.scss',
    '../shared-styles.css',
  ],
})
export class Step3Component extends BaseStepComponent implements OnInit {
  @Input() override wizardComponent?: any;

  constructor(
    @Inject(ErrorHandlerService) errorHandler: ErrorHandlerService,
    private fb: FormBuilder
  ) {
    super(errorHandler);
    this.initializeForm();
  }

  override ngOnInit(): void {
    // Register this step component with the wizard parent
    if (this.wizardComponent) {
      this.wizardComponent.registerStepComponent(2, this);
    }
  }

  /**
   * Initialize the form with all required social media fields
   * This form collects various social media platform information
   * and additional details about the customer/employee
   */
  private initializeForm(): void {
    this.form = this.fb.group({
      // Main social media toggle
      isHaveSoialMedia: [false],

      // General social media link (fallback)
      socialMediaLink: [''],

      // Website URL
      webSiteUrl: [''],
      website: [''], // Alternative website field used in HTML

      // Additional notes
      notes: [''],

      // Individual social media platform fields
      address: [''], // Twitter/X username
      skype: [''], // Skype username
      instgram: [''], // Instagram username
      snapchat: [''], // Snapchat username
      facebook: [''], // Facebook profile
      linkedin: [''], // LinkedIn profile
      youtube: [''], // YouTube channel
      tiktok: [''], // TikTok username
      whatsapp: [''], // WhatsApp number
    });
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
   * Clears all form field values
   */
  resetForm(): void {
    this.form.reset();
  }
}
