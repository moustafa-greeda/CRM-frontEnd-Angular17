import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BaseStepComponent } from '../base-step.component';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';

/**
 * Step3 Component - Social Media Information
 * This component handles the collection of social media and additional information
 * for the customer/employee wizard form.
 *
 * Features:
 * - Social media platform links collection
 * - Website URL input
 * - Form validation and error handling
 */
@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
  styleUrls: ['./step3.component.css', '../shared-styles.css'],
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
    // Now it's step 1 (index 1) since step2 is merged into step1
    if (this.wizardComponent) {
      this.wizardComponent.registerStepComponent(1, this);
    }
  }

  /* Initialize the form with all required social media fields*/
  private initializeForm(): void {
    this.form = this.fb.group({
      // Main social media toggle
      isHaveSoialMedia: [false],
      // socialMediaLink: [''],

      // Website URL
      webSiteUrl: [''], // Alternative website field used in HTML

      // Individual social media platform fields
      instgram: [''],
      snapchat: [''],
      facebook: [''],
      linkedin: [''],
      youtube: [''],
      tiktok: [''],
      twitter: [''],
      whatsapp: [''],
    });
  }

  /**
   * Get the current form data
   * Collects all social media platform links and converts them to JSON string
   * @returns Object containing all form field values with socialMediaLink as JSON string
   */
  getFormData() {
    const formValue = this.form.value;

    // Build social media links object
    const socialMediaLinks: any = {
      whatsapp: formValue.whatsapp || '',
      twitter: formValue.twitter || '',
      tiktok: formValue.tiktok || '',
      youtube: formValue.youtube || '',
      linkedin: formValue.linkedin || '',
      facebook: formValue.facebook || '',
      instagram: formValue.instgram || '', // Note: form field is 'instgram' but JSON key is 'instagram'
      snapchat: formValue.snapchat || '',
    };

    // Convert to JSON string and assign to socialMediaLink
    const socialMediaLinkJson = JSON.stringify(socialMediaLinks);

    // Return form data with socialMediaLink as JSON string
    return {
      ...formValue,
      socialMediaLink: socialMediaLinkJson,
    };
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

  /**
   * Load form data from existing data (for editing)
   * Parses socialMediaLink JSON string and populates individual fields
   * @param data Object containing form data, may include socialMediaLink as JSON string
   */
  setFormValues(data: any): void {
    // If socialMediaLink exists and is a JSON string, parse it
    if (data.socialMediaLink && typeof data.socialMediaLink === 'string') {
      try {
        const socialMediaLinks = JSON.parse(data.socialMediaLink);

        // Populate individual fields from parsed JSON
        if (socialMediaLinks.whatsapp) {
          this.form.patchValue({ whatsapp: socialMediaLinks.whatsapp });
        }
        if (socialMediaLinks.twitter) {
          this.form.patchValue({ twitter: socialMediaLinks.twitter });
        }
        if (socialMediaLinks.tiktok) {
          this.form.patchValue({ tiktok: socialMediaLinks.tiktok });
        }
        if (socialMediaLinks.youtube) {
          this.form.patchValue({ youtube: socialMediaLinks.youtube });
        }
        if (socialMediaLinks.linkedin) {
          this.form.patchValue({ linkedin: socialMediaLinks.linkedin });
        }
        if (socialMediaLinks.facebook) {
          this.form.patchValue({ facebook: socialMediaLinks.facebook });
        }
        if (socialMediaLinks.instagram) {
          // Note: JSON key is 'instagram' but form field is 'instgram'
          this.form.patchValue({ instgram: socialMediaLinks.instagram });
        }
        if (socialMediaLinks.snapchat) {
          this.form.patchValue({ snapchat: socialMediaLinks.snapchat });
        }
      } catch (error) {
        // If parsing fails, use the original value as fallback
        this.form.patchValue({ socialMediaLink: data.socialMediaLink });
      }
    }

    // Patch other form fields
    this.form.patchValue({
      isHaveSoialMedia: data.isHaveSoialMedia ?? false,
      webSiteUrl: data.webSiteUrl || '',
      website: data.website || data.webSiteUrl || '',
    });
  }
}
