import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

@Component({
  template: '',
})
export abstract class BaseStepComponent implements OnInit {
  @Input() form!: FormGroup;
  @Input() wizardComponent?: any; // Reference to wizard component

  constructor(protected errorHandler: ErrorHandlerService) {}

  ngOnInit(): void {
    // Ensure form is properly initialized
    if (!this.form) {
      // Form is not properly initialized
    }
  }

  getErrorMessage(controlName: string): string {
    return this.errorHandler.getErrorMessage(controlName, this.form);
  }

  onFieldBlur(controlName: string): void {
    const control = this.form.get(controlName);
    if (control) {
      control.markAsTouched();
    }
  }

  onFieldChange(controlName: string): void {
    const control = this.form.get(controlName);
    if (control) {
      control.markAsTouched();
      control.markAsDirty();
      // Force validation update immediately
      control.updateValueAndValidity();
      // Also update the parent form
      this.form.updateValueAndValidity();
      // Force change detection
      setTimeout(() => {
        this.form.updateValueAndValidity();
      }, 0);

      // Trigger Pac-Man movement if wizard component is available
      if (this.wizardComponent && control.value && control.valid) {
        this.wizardComponent.onFieldInput(controlName);
      }
    }
  }
}
