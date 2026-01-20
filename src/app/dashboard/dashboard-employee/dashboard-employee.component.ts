import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-employee',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-employee.component.html',
  styleUrls: [
    './dashboard-employee.component.css',
    '../sharedStyleDashboard.css',
  ],
})
export class DashboardEmployeeComponent {}
