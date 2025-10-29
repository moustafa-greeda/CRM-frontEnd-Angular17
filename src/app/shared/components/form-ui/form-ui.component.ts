import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  Inject,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { formUiConfig, FormField } from '../../interfaces/formUi.interface';

@Component({
  selector: 'app-form-ui',
  templateUrl: './form-ui.component.html',
  styleUrls: ['./form-ui.component.css'],
})
export class FormUiComponent implements OnInit {
  @Input() config?: formUiConfig;
  @Input() initialData?: Record<string, any>;
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();

  isDialog = false;

  form!: FormGroup;
  selectedFiles: { [key: string]: File } = {};

  constructor(
    private fb: FormBuilder,
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

  private buildForm(): void {
    if (!this.config) return;

    const controls: Record<string, any> = {};

    for (const field of this.config.fields) {
      const validators = field.required ? [Validators.required] : [];
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
          const input1Validators = field.input1.required
            ? [Validators.required]
            : [];
          const input1Value = this.initialData?.[field.input1.name] ?? '';
          controls[field.input1.name] = [input1Value, input1Validators];
        }
        if (field.input2) {
          const input2Validators = field.input2.required
            ? [Validators.required]
            : [];
          const input2Value = this.initialData?.[field.input2.name] ?? '';
          controls[field.input2.name] = [input2Value, input2Validators];
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
    }
    return '';
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
}
