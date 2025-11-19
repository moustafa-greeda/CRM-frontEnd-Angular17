import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Auth/auth.service';

@Component({
  selector: 'app-dashboard-account',
  templateUrl: './dashboard-account.component.html',
  styleUrls: [
    './dashboard-account.component.css',
    '../sharedStyleDashboard.css',
  ],
})
export class DashboardAccountComponent implements OnInit {
  userInfo: any = {};
  stats = {
    totalAccounts: 0,
    activeAccounts: 0,
    pendingApprovals: 0,
    revenue: 0,
  };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadStats();
  }

  loadUserInfo(): void {
    const userData = this.authService.getUserData();
    this.userInfo = userData || {};
  }

  loadStats(): void {
    // Load account management specific statistics
    this.stats = {
      totalAccounts: 156,
      activeAccounts: 142,
      pendingApprovals: 8,
      revenue: 2500000,
    };
  }

  navigateToAccounts(): void {
    this.router.navigate(['/dashboard/account/accounts']);
  }

  navigateToApprovals(): void {
    this.router.navigate(['/dashboard/account/approvals']);
  }

  navigateToReports(): void {
    this.router.navigate(['/dashboard/account/reports']);
  }
}
