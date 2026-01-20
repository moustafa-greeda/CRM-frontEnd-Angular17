import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard-legal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-legal.component.html',
  styleUrl: './dashboard-legal.component.css',
})
export class DashboardLegalComponent {}
