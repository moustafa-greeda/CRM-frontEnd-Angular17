import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css',
})
export class ForgetPasswordComponent {
  constructor(private router: Router) {}
  onSubmit() {
    // Here you can add form validation or API call if needed

    // Navigate to reset-password route
    this.router.navigate(['/otp-password']);
  }
}
