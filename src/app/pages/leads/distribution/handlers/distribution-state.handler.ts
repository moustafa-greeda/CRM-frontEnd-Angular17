import { signal, computed } from '@angular/core';
import { ITeleSalse } from '../../../../core/Models/employee/itele-salse';
import { ILeadDistribution } from '../../../../core/Models/leads/ilead-distribution';

export interface CustomerItem {
  id: string;
  name: string;
  group?: string;
}

/**
 * Handler for managing distribution component state using signals
 */
export class DistributionStateHandler {
  // ========== Data Signals ==========
  readonly teleSalseList = signal<ITeleSalse[]>([]);
  readonly leadsList = signal<ILeadDistribution[]>([]);
  readonly selectedRows = signal<any[]>([]);
  readonly assignedCustomers = signal<CustomerItem[]>([]);
  readonly availableCustomers = signal<CustomerItem[]>([]);

  // ========== Pagination Signals ==========
  readonly pageSize = signal<number>(10);
  readonly currentPage = signal<number>(1);
  readonly totalCount = signal<number>(0);

  // ========== Filter Signals ==========
  readonly searchTerm = signal<string>('');
  readonly selectedClient = signal<string>('');
  readonly assignmentFilter = signal<string>('جميع العملاء');

  // ========== UI State Signals ==========
  readonly isLoading = signal<boolean>(false);
  readonly isDragOver = signal<boolean>(false);
  readonly isSidebarCollapsed = signal<boolean>(false);

  // ========== Selection Signals ==========
  readonly selectedEmployee = signal<ITeleSalse | null>(null);

  // ========== Computed Signals ==========
  readonly employeeOptions = computed(() => {
    return this.teleSalseList().map((employee) => employee.name);
  });


  // ========== Methods ==========
  resetAssignmentState(): void {
    this.assignedCustomers.set([]);
    this.selectedRows.set([]);
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.assignmentFilter.set('جميع العملاء');
  }

  resetPagination(): void {
    this.currentPage.set(1);
  }
}
