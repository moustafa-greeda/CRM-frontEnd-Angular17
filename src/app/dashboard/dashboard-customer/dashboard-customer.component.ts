import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-customer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-customer.component.html',
  styleUrls: [
    './dashboard-customer.component.css',
    '../sharedStyleDashboard.css',
  ],
})
export class DashboardCustomerComponent {}
