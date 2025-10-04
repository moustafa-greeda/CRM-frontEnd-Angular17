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

import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  // isSidebarOpen = false; // Sidebar open state

  // // Toggle the Sidebar on or off
  // toggleSidebar() {
  //   this.isSidebarOpen = !this.isSidebarOpen;
  // }

  // // Close the Sidebar
  // closeSidebar() {
  //   this.isSidebarOpen = false;
  // }

  roles: string[] = [];
  employeeOpen = false;

  constructor() {
    // this.roles = JSON.parse(sessionStorage.getItem('roles') || '[]');
    this.roles = JSON.parse(sessionStorage.getItem('roles') || '[]');
  }

  // Check if the user is an Admin
  isAdmin(): boolean {
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

  // Toggle the employee submenu
  toggleEmployee() {
    this.employeeOpen = !this.employeeOpen;
  }
}
