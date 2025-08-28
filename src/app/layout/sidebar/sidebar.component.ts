import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  roles: string[] = [];
  employeeOpen = false;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.roles = JSON.parse(localStorage.getItem('roles') || '[]');
    } else {
      this.roles = [];
    }
  }

  // isAdmin(): boolean {
  //   return this.roles.includes('Admin');
  // }

  // isUser(): boolean {
  //   return this.roles.includes('User');
  // }

  // isCustomer(): boolean {
  //   return this.roles.includes('Customer');
  // }

  toggleEmployee(): void {
    this.employeeOpen = !this.employeeOpen;
  }
}
