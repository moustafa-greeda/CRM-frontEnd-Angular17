import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {
  closeSidebar() {
    const layout = document.querySelector('.dashboard-layout');
    layout?.classList.remove('sidebar-open');
  }
}