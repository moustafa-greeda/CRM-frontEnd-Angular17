import { Component, Inject, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../Auth/auth.service';
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

  @Input() isSidebarOpen: boolean = false;
  @Output() menuToggle = new EventEmitter<void>();

  toggleSidebar() {
    this.menuToggle.emit();
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

  getUserName(): string | null {
    return this.authService.getUsername();
  }

  getUserEmail(): string | null {
    return this.authService.getUserEmail();
  }

  getFirstNameChar(): string {
    const name = this.getUserName();
    if (name && name.length > 0) {
      // Get first character and convert to uppercase
      return name.charAt(0).toUpperCase();
    }
    return '';
  }
}
