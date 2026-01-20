import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  AfterViewInit,
  Inject,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { formUiConfig, FormField } from '../../interfaces/formUi.interface';
import { ButtonComponent } from '../../ui/button/button.component';
import { DropdownComponent } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-form-ui',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    ButtonComponent,
    DropdownComponent,
  ],
  templateUrl: './form-ui.component.html',
  styleUrls: ['./form-ui.component.css'],
})
export class FormUiComponent implements OnInit, AfterViewInit {
  @Input() config?: formUiConfig;
  @Input() initialData?: Record<string, any>;
  @Input() isLoading: boolean = false;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();

  isDialog = false;
  private isFormReady = false;

  form!: FormGroup;
  selectedFiles: { [key: string]: File } = {};

  constructor(
    private fb: FormBuilder,
    private elementRef: ElementRef,
    @Inject(MAT_DIALOG_DATA)
    public dialogData?: {
      config: formUiConfig;
      initialData?: Record<string, any>;
    },
    private dialogRef?: MatDialogRef<FormUiComponent>
  ) {
    this.isDialog = !!dialogRef;
  }

  ngOnInit(): void {
    // Use dialog data if available, otherwise use input properties
    if (this.isDialog && this.dialogData) {
      this.config = this.dialogData.config;
      this.initialData = this.dialogData.initialData;
    }
    this.buildForm();
  }

  ngAfterViewInit(): void {
    // Add a small delay to prevent immediate close when form opens
    setTimeout(() => {
      this.isFormReady = true;
    }, 100);
  }

  private buildForm(): void {
    if (!this.config) return;

    const controls: Record<string, any> = {};

    for (const field of this.config.fields) {
      const validators: any[] = [];

      // Add required validator if field is required
      if (field.required) {
        validators.push(Validators.required);
      }

      // Add email validator if field type is email
      if (field.type === 'email') {
        validators.push(Validators.email);
      }

      // Add pattern validator if pattern is specified
      if (field.pattern) {
        const pattern =
          typeof field.pattern === 'string'
            ? new RegExp(field.pattern)
            : field.pattern;
        validators.push(Validators.pattern(pattern));
      }

      // Add minLength validator if specified
      if (field.minLength !== undefined) {
        validators.push(Validators.minLength(field.minLength));
      }

      // Add maxLength validator if specified
      if (field.maxLength !== undefined) {
        validators.push(Validators.maxLength(field.maxLength));
      }

      const initialValue = this.initialData?.[field.name] ?? '';

      if (field.type === 'checkbox') {
        // For checkboxes, use FormArray to handle multiple selections
        const checkboxControls: FormControl[] = [];
        if (field.options) {
          field.options.forEach((option) => {
            const isChecked =
              Array.isArray(initialValue) &&
              initialValue.includes(option.value);
            checkboxControls.push(new FormControl(isChecked));
          });
        }
        controls[field.name] = new FormArray(checkboxControls);
      } else if (field.type === 'file') {
        // For file inputs, use FormControl with null initial value
        controls[field.name] = [null, validators];
      } else if (field.type === 'two-inputs') {
        // For two-inputs, create controls for both inputs
        if (field.input1) {
          const input1Validators: any[] = [];
          if (field.input1.required) {
            input1Validators.push(Validators.required);
          }
          if (field.input1.pattern) {
            const pattern =
              typeof field.input1.pattern === 'string'
                ? new RegExp(field.input1.pattern)
                : field.input1.pattern;
            input1Validators.push(Validators.pattern(pattern));
          }
          if (field.input1.minLength !== undefined) {
            input1Validators.push(Validators.minLength(field.input1.minLength));
          }
          if (field.input1.maxLength !== undefined) {
            input1Validators.push(Validators.maxLength(field.input1.maxLength));
          }
          const input1Value = this.initialData?.[field.input1.name] ?? '';
          const input1Control = new FormControl(input1Value, input1Validators);
          // Disable if specified in config
          if (field.input1.disabled) {
            input1Control.disable();
          }
          controls[field.input1.name] = input1Control;
        }
        if (field.input2) {
          const input2Validators: any[] = [];
          if (field.input2.required) {
            input2Validators.push(Validators.required);
          }
          if (field.input2.pattern) {
            const pattern =
              typeof field.input2.pattern === 'string'
                ? new RegExp(field.input2.pattern)
                : field.input2.pattern;
            input2Validators.push(Validators.pattern(pattern));
          }
          if (field.input2.minLength !== undefined) {
            input2Validators.push(Validators.minLength(field.input2.minLength));
          }
          if (field.input2.maxLength !== undefined) {
            input2Validators.push(Validators.maxLength(field.input2.maxLength));
          }
          const input2Value = this.initialData?.[field.input2.name] ?? '';
          const input2Control = new FormControl(input2Value, input2Validators);
          // Disable if specified in config
          if (field.input2.disabled) {
            input2Control.disable();
          }
          controls[field.input2.name] = input2Control;
        }
      } else {
        controls[field.name] = [initialValue, validators];
      }
    }

    this.form = this.fb.group(controls);
  }

  onSubmit(): void {
    if (this.form.valid) {
      // Merge form data with selected files
      const formData = { ...this.form.value };

      // Replace file_selected flags with actual file objects
      Object.keys(this.selectedFiles).forEach((fieldName) => {
        formData[fieldName] = this.selectedFiles[fieldName];
      });

      // Do NOT close dialog automatically on submit.
      // Emit the data and let the parent decide when to close (e.g., on API success)
      this.formSubmit.emit(formData);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    if (this.isDialog && this.dialogRef) {
      this.dialogRef.close();
    } else {
      this.formCancel.emit();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(fieldName)} مطلوب`;
      }
      if (control.errors['email']) {
        return 'البريد الإلكتروني غير صحيح';
      }
      if (control.errors['pattern']) {
        const errorMessage = this.getPatternErrorMessage(fieldName);
        return errorMessage || 'القيمة المدخلة غير صحيحة';
      }
      if (control.errors['minlength']) {
        const minLength = control.errors['minlength'].requiredLength;
        return `يجب أن يكون ${this.getFieldLabel(
          fieldName
        )} على الأقل ${minLength} أحرف`;
      }
      if (control.errors['maxlength']) {
        const maxLength = control.errors['maxlength'].requiredLength;
        return `يجب أن يكون ${this.getFieldLabel(
          fieldName
        )} على الأكثر ${maxLength} أحرف`;
      }
    }
    return '';
  }

  private getPatternErrorMessage(fieldName: string): string | null {
    if (!this.config) return null;

    // Check in regular fields
    const field = this.config.fields.find((f) => f.name === fieldName);
    if (field?.patternErrorMessage) {
      return field.patternErrorMessage;
    }

    // Check in two-inputs fields (input1 and input2)
    for (const f of this.config.fields) {
      if (f.type === 'two-inputs') {
        if (f.input1?.name === fieldName && f.input1.patternErrorMessage) {
          return f.input1.patternErrorMessage;
        }
        if (f.input2?.name === fieldName && f.input2.patternErrorMessage) {
          return f.input2.patternErrorMessage;
        }
      }
    }

    return null;
  }

  private getFieldLabel(fieldName: string): string {
    if (!this.config) return fieldName;
    const field = this.config.fields.find((f) => f.name === fieldName);
    return field?.label || fieldName;
  }

  onCheckboxChange(fieldName: string, optionValue: any, event: any): void {
    const checkboxArray = this.form.get(fieldName) as FormArray;
    const field = this.config?.fields.find((f) => f.name === fieldName);

    if (field && field.options) {
      const optionIndex = field.options.findIndex(
        (opt) => opt.value === optionValue
      );
      if (optionIndex !== -1) {
        checkboxArray.at(optionIndex).setValue(event.target.checked);
      }
    }
  }

  onFileChange(fieldName: string, event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Store the file in a separate property instead of form control
      if (!this.selectedFiles) {
        this.selectedFiles = {};
      }
      this.selectedFiles[fieldName] = file;

      // Set a flag in the form control to indicate file is selected
      this.form.get(fieldName)?.setValue('file_selected');
    }
  }

  getFileInputText(fieldName: string): string {
    if (this.selectedFiles && this.selectedFiles[fieldName]) {
      return this.selectedFiles[fieldName].name || 'تم اختيار ملف';
    }
    return 'اختر ملف أو اسحب الملف هنا';
  }

  // Get the actual file object
  getSelectedFile(fieldName: string): File | null {
    return this.selectedFiles && this.selectedFiles[fieldName]
      ? this.selectedFiles[fieldName]
      : null;
  }

  // Clear selected file
  clearFile(fieldName: string): void {
    if (this.selectedFiles && this.selectedFiles[fieldName]) {
      delete this.selectedFiles[fieldName];
      this.form.get(fieldName)?.setValue('');
    }
  }

  // Close form when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Only handle if form is configured and ready
    if (!this.config || !this.isFormReady) {
      return;
    }

    // Check if click is outside the form container
    const clickedInside = this.elementRef.nativeElement.contains(
      event.target as Node
    );

    if (!clickedInside) {
      this.onCancel();
    }
  }
}
