import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.css',
})
export class EmployeeFormComponent {
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EmployeeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  // employee-dialog.component.ts

  form = this.fb.group({
    // شخصي
    firstName: this.fb.control<string>('', { nonNullable: true }),
    email: this.fb.control<string>('', { nonNullable: true }),
    phone: this.fb.control<string>('', { nonNullable: true }),
    gender: this.fb.control<string>('ذكر', { nonNullable: true }),
    birthDate: this.fb.control<Date | null>(null),

    address: this.fb.control<string>(''),

    // الشركة
    department: this.fb.control<string>('', { nonNullable: true }),
    title: this.fb.control<string>('', { nonNullable: true }),
    hireDate: this.fb.control<Date | null>(null),

    // المستندات
    idDoc: this.fb.control<File | null>(null), // <-- allow File here
  });

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.form.get('idDoc')!.setValue(input.files[0]); // File | null matches control type
      this.form.get('idDoc')!.markAsDirty();
    }
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // If uploading files, you’ll typically build a FormData in the parent.
    this.dialogRef.close(this.form.value);
  }

  cancel() {
    this.dialogRef.close();
  }
}
