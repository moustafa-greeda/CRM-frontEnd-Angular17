import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { BaseStepComponent } from '../base-step.component';
import { ErrorHandlerService } from '../../../../../core/services/error-handler.service';

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.css', '../shared-styles.css'],
})
export class Step2Component extends BaseStepComponent implements OnInit {
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
      facebook: ['', Validators.required],
      linkedin: [''],
      youtube: [''],
      tiktok: [''],
      twitter: [''],
      whatsapp: [''],
    });
  }

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

  isFormValid(): boolean {
    return this.form.valid;
  }

  markAllFieldsAsTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      this.form.get(key)?.markAsTouched();
    });
  }

  resetForm(): void {
    this.form.reset();
  }

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
