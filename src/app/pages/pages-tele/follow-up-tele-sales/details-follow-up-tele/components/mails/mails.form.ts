import { FormBuilder, Validators, FormGroup } from '@angular/forms';

export interface MailForm {
  to: string;
  subject: string;
  body: string;
  cc: string;
  bcc: string;
}

export function createMailForm(fb: FormBuilder): FormGroup {
  return fb.group({
    to: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    body: ['', Validators.required],
    cc: [''],
    bcc: [''],
  });
}
