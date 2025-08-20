import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormFieldConfig } from '../../../core/Models/form/user';

@Component({
  selector: 'app-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrl: './form-dialog.component.css',
})
export class FormDialogComponent {
  form!: FormGroup;
  constructor(
    public dialogRef: MatDialogRef<FormDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      fields: FormFieldConfig[];
      initialData?: any;
    }
  ) {}

  ngOnInit(): void {
    const formGroup: { [key: string]: any } = {};
    this.data.fields.forEach((field) => {
      formGroup[field.name] = [
        this.data.initialData?.[field.name] || '',
        field.required ? Validators.required : [],
      ];
    });
    this.form = this.fb.group(formGroup);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.value);
  }
}
