import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
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
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('roles');
    }

    this.router.navigate(['/login']);
  }
}
