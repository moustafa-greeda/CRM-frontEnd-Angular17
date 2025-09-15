import { Injectable } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor() { }

  // Global Error Message Handler for Wizard
  getErrorMessage(controlName: string, form: FormGroup): string {
    return this.handleFieldError(controlName, form);
  }

  // Centralized Error Message Handler
  handleFieldError(controlName: string, form: FormGroup): string {
    const control = form.get(controlName);
    if (!control) {
      return '';
    }

    // If field has a value (not empty), don't show required error
    if (control.value && control.value.toString().trim() !== '') {
      // Only show specific validation errors if field has value but is invalid
      if (control.errors) {
        return this.getSpecificErrorMessage(control.errors);
      }
      // If field has value and no errors, don't show any error
      return '';
    }

    // If field is empty and required, show error only if touched or dirty
    if ((control.touched || control.dirty) && control.errors && control.errors['required']) {
      return 'هذا الحقل مطلوب';
    }

    return '';
  }

  // Get specific error message based on error type
  private getSpecificErrorMessage(errors: any): string {
    if (errors['email']) {
      return 'يرجى إدخال بريد إلكتروني صحيح';
    }
    if (errors['minlength']) {
      return `يجب أن يكون ${errors['minlength'].requiredLength} أحرف على الأقل`;
    }
    if (errors['min']) {
      return `يجب أن تكون القيمة ${errors['min'].min} على الأقل`;
    }
    if (errors['max']) {
      return `يجب أن تكون القيمة ${errors['max'].max} على الأكثر`;
    }
    if (errors['pattern']) {
      return 'تنسيق غير صحيح';
    }
    if (errors['required']) {
      return 'هذا الحقل مطلوب';
    }
    return '';
  }

  // Check if field has error
  hasFieldError(controlName: string, form: FormGroup): boolean {
    const control = form.get(controlName);
    if (!control) {
      return false;
    }

    // If field has value, check for specific errors
    if (control.value && control.value.toString().trim() !== '') {
      return control.errors ? Object.keys(control.errors).length > 0 : false;
    }

    // If field is empty, check if it's required and touched/dirty
    return (control.touched || control.dirty) && control.errors && control.errors['required'];
  }

  // Get all errors for current form
  getAllFormErrors(form: FormGroup): { [key: string]: string } {
    const errors: { [key: string]: string } = {};
    
    Object.keys(form.controls).forEach(key => {
      const errorMessage = this.handleFieldError(key, form);
      if (errorMessage) {
        errors[key] = errorMessage;
      }
    });
    
    return errors;
  }

  // Check if current form has any errors
  hasFormErrors(form: FormGroup): boolean {
    return !form.valid && (form.touched || form.dirty);
  }

  // Clear all errors for a specific field
  clearFieldError(controlName: string, form: FormGroup): void {
    const control = form.get(controlName);
    if (control) {
      control.setErrors(null);
      control.markAsUntouched();
      control.markAsPristine();
    }
  }

  // Clear all errors for current form
  clearAllFormErrors(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      this.clearFieldError(key, form);
    });
  }

  // Mark field as touched and dirty to trigger validation
  markFieldAsTouched(controlName: string, form: FormGroup): void {
    const control = form.get(controlName);
    if (control) {
      control.markAsTouched();
      control.markAsDirty();
      control.updateValueAndValidity();
    }
  }

  // Validate current form and return validation status
  validateCurrentForm(form: FormGroup): { isValid: boolean; errors: { [key: string]: string } } {
    const errors = this.getAllFormErrors(form);
    
    return {
      isValid: form.valid && Object.keys(errors).length === 0,
      errors: errors
    };
  }

  // Force validation on current form
  forceValidationCurrentForm(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control) {
        control.markAsTouched();
        control.markAsDirty();
        control.updateValueAndValidity();
      }
    });
  }

  // Mark form group as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
