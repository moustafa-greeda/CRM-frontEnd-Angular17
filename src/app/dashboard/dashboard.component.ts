import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../Auth/auth.service';
import { Router, ActivatedRoute, NavigationEnd, RouterModule } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css', './sharedStyleDashboard.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  // Use signals for better performance
  userType = signal<string | null>(null);
  modulePath = computed(() => this.getModulePathByUserType(this.userType()));

  // Module path mapping - cached for performance
  private readonly modulePathMap: Record<string, string> = {
    TeleSales: 'telesales',
    Sales: 'sales',
    Accountant: 'accountant',
    Tech: 'tech',
    'Legal Affairs': 'legal',
    Admin: 'admin',
    Employee: 'employee',
    Customer: 'customer',
  };

  ngOnInit(): void {
    const userType = this.authService.getUserType();
    this.userType.set(userType);

    // If no userType, redirect to login
    if (!userType) {
      this.router.navigate(['/login']);
      return;
    }

    // Listen to route changes only when needed
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.checkAndRedirect();
      });

    // Initial check - only once
    this.checkAndRedirect();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkAndRedirect(): void {
    const currentUrl = this.router.url;

    // If we're at /dashboard (without any child route), redirect to appropriate module
    if (currentUrl === '/dashboard' || currentUrl === '/dashboard/') {
      this.redirectToUserModule();
    }
  }

  private redirectToUserModule(): void {
    const path = this.modulePath();
    if (path) {
      // Use replaceUrl to avoid adding to history stack
      this.router.navigate([`/dashboard/${path}`], { replaceUrl: true });
    }
  }

  private getModulePathByUserType(userType: string | null): string | null {
    if (!userType) return 'admin';
    return this.modulePathMap[userType] || 'admin';
  }
}
