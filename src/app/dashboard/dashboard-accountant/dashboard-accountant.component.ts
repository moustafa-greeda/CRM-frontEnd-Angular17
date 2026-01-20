import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Auth/auth.service';

@Component({
  selector: 'app-dashboard-accountant',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-accountant.component.html',
  styleUrls: [
    './dashboard-accountant.component.css',
    '../sharedStyleDashboard.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardAccountantComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly userInfo = signal<any>({});
  readonly stats = signal({
    totalAccounts: 0,
    activeAccounts: 0,
    pendingApprovals: 0,
    revenue: 0,
  });

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadStats();
  }

  loadUserInfo(): void {
    const userData = this.authService.getUserData();
    this.userInfo.set(userData || {});
  }

  loadStats(): void {
    // Load account management specific statistics
    this.stats.set({
      totalAccounts: 156,
      activeAccounts: 142,
      pendingApprovals: 8,
      revenue: 2500000,
    });
  }
}
