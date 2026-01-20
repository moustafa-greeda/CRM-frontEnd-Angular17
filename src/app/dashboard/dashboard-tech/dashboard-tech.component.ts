import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Auth/auth.service';

@Component({
  selector: 'app-dashboard-tech',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-tech.component.html',
  styleUrls: ['./dashboard-tech.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardTechComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly userInfo = signal<any>({});
  readonly stats = signal({
    totalTickets: 0,
    openTickets: 0,
    resolvedTickets: 0,
    systemUptime: 0,
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
    // Load tech support specific statistics
    this.stats.set({
      totalTickets: 89,
      openTickets: 12,
      resolvedTickets: 77,
      systemUptime: 99.9,
    });
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
