// // // import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
// // // import { isPlatformBrowser } from '@angular/common';

// // // @Component({
// // //   selector: 'app-sidebar',
// // //   templateUrl: './sidebar.component.html',
// // //   styleUrl: './sidebar.component.css',
// // // })
// // // export class SidebarComponent implements OnInit {
// // //   roles: string[] = [];
// // //   employeeOpen = false;

// // //   constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {}

// // //   ngOnInit() {
// // //     if (isPlatformBrowser(this.platformId)) {
// // //       this.roles = JSON.parse(localStorage.getItem('roles') || '[]');
// // //     } else {
// // //       this.roles = [];
// // //     }
// // //   }

// // //   // isAdmin(): boolean {
// // //   //   return this.roles.includes('Admin');
// // //   // }

// // //   // isUser(): boolean {
// // //   //   return this.roles.includes('User');
// // //   // }

// // //   // isCustomer(): boolean {
// // //   //   return this.roles.includes('Customer');
// // //   // }

// // //   toggleEmployee(): void {
// // //     this.employeeOpen = !this.employeeOpen;
// // //   }
// // // }

// // import { Component, OnInit, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
// // import { isPlatformBrowser } from '@angular/common';

// // @Component({
// //   selector: 'app-sidebar',
// //   templateUrl: './sidebar.component.html',
// //   styleUrls: ['./sidebar.component.css'],
// // })
// // export class SidebarComponent implements OnInit {
// //   roles: string[] = [];
// //   employeeOpen = false;

// //   constructor(
// //     @Inject(PLATFORM_ID) private readonly platformId: Object,
// //     private renderer: Renderer2
// //   ) {}

// //   ngOnInit() {
// //     if (isPlatformBrowser(this.platformId)) {
// //       this.roles = JSON.parse(localStorage.getItem('roles') || '[]');
// //     }
// //   }

// //   toggleEmployee(): void {
// //     this.employeeOpen = !this.employeeOpen;
// //   }
// // }

// import { Component, OnInit, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';

// @Component({
//   selector: 'app-sidebar',
//   templateUrl: './sidebar.component.html',
//   styleUrls: ['./sidebar.component.css'],
// })
// export class SidebarComponent implements OnInit {
//   roles: string[] = [];
//   employeeOpen = false;
//   isCollapsed = false; // <-- new property

//   constructor(
//     @Inject(PLATFORM_ID) private readonly platformId: Object,
//     private renderer: Renderer2
//   ) {}

//   ngOnInit() {
//     if (isPlatformBrowser(this.platformId)) {
//       this.roles = JSON.parse(localStorage.getItem('roles') || '[]');
//     }
//   }

//   toggleEmployee(): void {
//     this.employeeOpen = !this.employeeOpen;
//   }

//   toggleSidebar(): void {
//     this.isCollapsed = !this.isCollapsed; // toggle collapsed state
//   }
// }

// import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';

// @Component({
//   selector: 'app-sidebar',
//   templateUrl: './sidebar.component.html',
//   styleUrls: ['./sidebar.component.css'],
// })
// export class SidebarComponent implements OnInit {
//   roles: string[] = [];
//   employeeOpen = false;

//   constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

//   ngOnInit() {
//     if (isPlatformBrowser(this.platformId)) {
//       this.roles = JSON.parse(localStorage.getItem('roles') || '[]');
//     }
//   }

//   toggleEmployee(): void {
//     this.employeeOpen = !this.employeeOpen;
//   }
// }

import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../Auth/login/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  roles: string[] = [];
  userType: string | null = null;
  employeeOpen = false;

  constructor(
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.roles = this.authService.getUserRoles();
      this.userType = this.authService.getUserType();

      // Debug logging
      console.log('Sidebar - Roles:', this.roles);
      console.log('Sidebar - UserType:', this.userType);
      console.log('Sidebar - isAdmin():', this.isAdmin());
      console.log('Sidebar - isTeleSales():', this.isTeleSales());
      console.log('Sidebar - isSales():', this.isSales());
      console.log('Sidebar - isAccount():', this.isAccount());
      console.log('Sidebar - isTech():', this.isTech());
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
