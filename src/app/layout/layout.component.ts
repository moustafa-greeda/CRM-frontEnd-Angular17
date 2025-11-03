import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit {
  isSidebarOpen = true;
  isSidebarCollapsed = false;

  get isMobile(): boolean {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1200;
    }
    return false;
  }

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    if (window.innerWidth < 1200) {
      this.isSidebarOpen = false;
      this.isSidebarCollapsed = false;
    } else {
      this.isSidebarOpen = true;
      // On larger screens, allow collapsed state for icon-only view
      if (!this.isSidebarCollapsed) {
        this.isSidebarCollapsed = false;
      }
    }
  }

  toggleSidebar() {
    if (window.innerWidth < 1200) {
      // Mobile: toggle open/closed
      this.isSidebarOpen = !this.isSidebarOpen;
    } else {
      // Desktop: toggle collapsed/expanded
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }

  closeSidebar() {
    this.isSidebarOpen = false;
  }
}
