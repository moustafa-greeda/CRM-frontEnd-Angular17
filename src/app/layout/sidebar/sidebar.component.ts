import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../Auth/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  @Input() isCollapsed: boolean = false;
  @Output() toggleCollapse = new EventEmitter<void>();
  roles: string[] = [];
  userType: string | null = null;
  employeeOpen = false;

  onToggle() {
    this.toggleCollapse.emit();
  }

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.roles = this.authService.getUserRoles();
      this.userType = this.authService.getUserType();
    }
  }

  // Check if the user is an Admin
  isAdmin(): boolean {
    // Prioritize userType over roles
    if (this.userType) {
      return this.userType === 'Admin';
    }
    return this.roles.includes('Admin');
  }

  // Check if the user is a User
  isUser(): boolean {
    return this.roles.includes('User');
  }

  // Check if the user is a Customer
  isCustomer(): boolean {
    return this.roles.includes('Customer');
  }

  // Check if the user is a TeleSales
  isTeleSales(): boolean {
    // Prioritize userType over roles
    if (this.userType) {
      return this.userType === 'TeleSales';
    }
    return this.roles.includes('TeleSalse');
  }

  // Check if the user is a Sales
  isSales(): boolean {
    // Prioritize userType over roles
    if (this.userType) {
      return this.userType === 'Sales';
    }
    return this.roles.includes('Sales');
  }

  // Check if the user is an Account
  isAccount(): boolean {
    // Prioritize userType over roles
    if (this.userType) {
      return this.userType === 'Account';
    }
    return this.roles.includes('Account');
  }

  // Check if the user is a Tech
  isTech(): boolean {
    // Prioritize userType over roles
    if (this.userType) {
      return this.userType === 'Tech';
    }
    return this.roles.includes('Tech');
  }

  // Toggle the employee submenu
  toggleEmployee() {
    this.employeeOpen = !this.employeeOpen;
  }
}
