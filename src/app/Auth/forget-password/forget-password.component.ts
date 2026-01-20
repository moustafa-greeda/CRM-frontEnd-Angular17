import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
