import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../Auth/login/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class HeaderComponent {
  constructor(
    private router: Router,
    public themeService: ThemeService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {}

  theme$ = this.themeService.theme$;

  isSidebarOpen = true;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    const layout = document.querySelector('.dashboard-layout');
    if (layout) {
      if (this.isSidebarOpen) {
        layout.classList.add('sidebar-open');
      } else {
        layout.classList.remove('sidebar-open');
      }
    }
  }
  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout() {
    this.authService.logout();
  }
}
