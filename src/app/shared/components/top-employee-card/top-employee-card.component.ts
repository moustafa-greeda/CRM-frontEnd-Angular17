import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoResultsMessageComponent } from '../no-results-message/no-results-message.component';

/**
 * Generic interface for top employee data
 * Supports both Sales and TeleSales data structures
 */
export interface TopEmployee {
  // Name fields (one of these should be present)
  salesName?: string;
  teleSalesName?: string;
  employeeName?: string;
  name?: string;
  
  // Common fields
  profileImage?: string;
  totalLeads: number;
  
  // Optional fields
  totalBudget?: number;
}

@Component({
  selector: 'app-top-employee-card',
  standalone: true,
  imports: [CommonModule, NoResultsMessageComponent],
  templateUrl: './top-employee-card.component.html',
  styleUrl: './top-employee-card.component.css',
})
export class TopEmployeeCardComponent {
  @Input() topPeople: TopEmployee[] = [];
  @Input() title: string = 'Best 3 Sales';
  @Input() currency: string = 'ج.م';
  @Input() showBudget: boolean = true; // Control whether to show budget stat

  /**
   * Get medal icon based on rank
   */
  getMedalIcon(rank: number): string {
    const medals: Record<number, string> = {
      1: './assets/icon/gold-medal.svg',
      2: './assets/icon/silver-medal.svg',
      3: './assets/icon/bronze-medal.svg',
    };
    return medals[rank] || './assets/icon/gold-medal.svg';
  }

  /**
   * Format currency with Arabic number format
   */
  formatCurrency(amount: number): string {
    if (amount == null) return `0 ${this.currency}`;
    
    return new Intl.NumberFormat('ar-EG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount) + ` ${this.currency}`;
  }

  /**
   * Get profile image with fallback
   */
  getProfileImage(person: TopEmployee): string {
    return person.profileImage || './assets/img/avatar-male.svg';
  }

  /**
   * Get employee name from various possible fields
   */
  getEmployeeName(person: TopEmployee): string {
    return person.salesName || 
           person.teleSalesName || 
           person.employeeName || 
           person.name || 
           'غير محدد';
  }

  /**
   * Check if budget should be displayed
   */
  shouldShowBudget(person: TopEmployee): boolean {
    return this.showBudget && person.totalBudget !== undefined && person.totalBudget !== null;
  }
}
