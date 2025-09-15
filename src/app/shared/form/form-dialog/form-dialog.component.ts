import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.css'],
})
export class FormDialogComponent implements OnInit {
  form!: FormGroup;
  previews: Record<string, string> = {};

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      fields: Array<
        | {
            name: string;
            label: string;
            type: 'text' | 'email' | 'number' | 'textarea';
            required?: boolean;
          }
        | {
            name: string;
            label: string;
            type: 'select';
            required?: boolean;
            options: { value: any; label: string }[];
          }
        | { name: string; label: string; type: 'date'; required?: boolean }
        | { name: string; label: string; type: 'checkbox'; required?: boolean }
        | {
            name: string;
            label: string;
            type: 'radio';
            required?: boolean;
            options: { value: any; label: string }[];
          }
        | { name: string; label: string; type: 'image'; required?: boolean }
      >;
      initialData?: Record<string, any>;
    }
  ) {}

  ngOnInit(): void {
    const controls: Record<string, any> = {};
    for (const f of this.data.fields) {
      const validators = f.required ? [Validators.required] : [];
      const initial =
        f.type === 'checkbox'
          ? !!this.data.initialData?.[f.name]
          : f.type === 'image'
          ? null
          : this.data.initialData?.[f.name] ?? '';
      controls[f.name] = [initial, validators];
    }
    this.form = this.fb.group(controls);

  }

  onImageChange(ev: Event, controlName: string) {
    const input = ev.target as HTMLInputElement;
    const file = input.files && input.files[0] ? input.files[0] : null;
    this.form.get(controlName)?.setValue(file);
    this.form.get(controlName)?.markAsDirty();

    if (file) {
      const reader = new FileReader();
      reader.onload = () =>
        (this.previews[controlName] = String(reader.result));
      reader.readAsDataURL(file);
    } else {
      delete this.previews[controlName];
    }
  }

  onCancel() {
    this.ref.close();
  }
  onSubmit() {
    if (this.form.valid) this.ref.close(this.form.value);
  }
}

