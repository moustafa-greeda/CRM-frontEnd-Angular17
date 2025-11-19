import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Auth/auth.service';

@Component({
  selector: 'app-dashboard-tech',
  templateUrl: './dashboard-tech.component.html',
  styleUrls: ['./dashboard-tech.component.css'],
})
export class DashboardTechComponent implements OnInit {
  userInfo: any = {};
  stats = {
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    systemUptime: 0,
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
    // Load tech support specific statistics
    this.stats = {
      totalTickets: 89,
      openTickets: 12,
      resolvedTickets: 77,
      systemUptime: 99.9,
    };
  }

  navigateToTickets(): void {
    this.router.navigate(['/dashboard/tech/tickets']);
  }

  navigateToSystem(): void {
    this.router.navigate(['/dashboard/tech/system']);
  }

  navigateToReports(): void {
    this.router.navigate(['/dashboard/tech/reports']);
  }
}
