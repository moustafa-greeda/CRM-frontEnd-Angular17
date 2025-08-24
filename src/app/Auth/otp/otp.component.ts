import { Component, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.css',
})
export class OtpComponent {
  constructor(private router: Router) {}

  digits = Array(5).fill(0);
  otp: string[] = ['', '', '', '', ''];
  AfterViewInit() {
    this.otpInputs.first?.nativeElement.focus();
  }

  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  ngAfterViewInit(): void {
    // Focus the first OTP box when the view is ready
    const first = this.otpInputs.first?.nativeElement;
    if (first) first.focus(); // HTMLElement.focus() focuses a control. :contentReference[oaicite:0]{index=0}
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, ''); // only numbers
    this.otp[index] = value;
    input.value = value; // enforce single digit if user pasted

    // Move to next input if this box has a value
    if (value && index < this.digits.length - 1) {
      const next = input.nextElementSibling as HTMLInputElement | null;
      next?.focus();
    }

    // Auto-submit if last box filled
    if (index === this.digits.length - 1 && value) {
      this.submitOtp();
    }
  }
  onBackspace(event: Event, index: number) {
    const kev = event as KeyboardEvent; // narrow to KeyboardEvent
    const input = event.target as HTMLInputElement;

    if (!this.otp[index] && index > 0) {
      const prev = input.previousElementSibling as HTMLInputElement | null;
      prev?.focus();
    }
  }

  submitOtp() {
    const code = this.otp.join('');
    if (code.length === this.digits.length) {
      // TODO: validate OTP with backend
      this.router.navigate(['/reset-password']);
    }
  }

  // ======================================= onSubmit function
  onSubmit() {
    this.router.navigate(['/reset-password']);
  }
}
