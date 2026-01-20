import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DistributionService } from './distribution.service';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';
import { BreadcrumbItem } from '../../../shared/interfaces/breadcrumb-item.interface';
import { DistributionStateHandler } from './handlers/distribution-state.handler';
import { DistributionFilterHandler } from './handlers/distribution-filter.handler';
import { DistributionAssignmentHandler } from './handlers/distribution-assignment.handler';
import { DistributionDragDropHandler } from './handlers/distribution-drag-drop.handler';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { CountLeadComponent } from '../../../shared/components/count-lead/count-lead.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TableComponent } from '../../../shared/components/table/table.component';

@Component({
  selector: 'app-distribution',
  standalone: true,
  imports: [CommonModule, DropdownComponent, SearchInputComponent, CountLeadComponent, PageHeaderComponent, TableComponent],
  templateUrl: './distribution.component.html',
  styleUrls: ['./distribution.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DistributionComponent implements OnInit {
  // ========== Handlers ==========
  readonly state = new DistributionStateHandler();
  private readonly filterHandler: DistributionFilterHandler;
  private readonly assignmentHandler: DistributionAssignmentHandler;
  private readonly dragDropHandler: DistributionDragDropHandler;

  // ========== Public State (exposed to template) ==========
  readonly teleSalseList = this.state.teleSalseList.asReadonly();
  readonly leadsList = this.state.leadsList.asReadonly();
  readonly selectedRows = this.state.selectedRows.asReadonly();
  readonly assignedCustomers = this.state.assignedCustomers.asReadonly();

  readonly pageSize = this.state.pageSize.asReadonly();
  readonly currentPage = this.state.currentPage.asReadonly();
  readonly totalCount = this.state.totalCount.asReadonly();

  readonly searchTerm = this.state.searchTerm.asReadonly();
  readonly selectedClient = this.state.selectedClient.asReadonly();
  readonly assignmentFilter = this.state.assignmentFilter.asReadonly();

  readonly isLoading = this.state.isLoading.asReadonly();
  readonly isDragOver = this.state.isDragOver.asReadonly();
  readonly isSidebarCollapsed = this.state.isSidebarCollapsed.asReadonly();

  readonly selectedEmployee = this.state.selectedEmployee.asReadonly();

  // ========== Computed Properties ==========
  readonly employeeOptions = this.state.employeeOptions;

  // Computed property to check if all items are selected
  readonly isAllSelected = computed(() => {
    const leadsList = this.state.leadsList();
    const selectedRows = this.state.selectedRows();
    return leadsList.length > 0 && selectedRows.length === leadsList.length;
  });

  // ========== UI Configuration ==========
  readonly pageTitle = 'إدارة التوزيع';

  readonly breadcrumb: BreadcrumbItem[] = [
    { label: 'الرئيسية' },
    { label: 'التوزيع', active: true },
  ];

  readonly companyColumns = [
    { key: 'dragHandle', header: '', width: '50px' },
    { key: 'name', header: 'اسم العميل' },
    { key: 'phone', header: 'رقم الهاتف' },
    { key: 'leadStatusName', header: 'حالة العميل' },
    { key: 'leadSourceName', header: 'مصدر العميل' },
    { key: 'assignedTo', header: 'مخصص ل' },
    { key: 'createdAt', header: 'تاريخ الإنشاء' },
  ];

  // Filter dropdowns - using a computed signal for reactive updates
  readonly filterDropdowns = computed(() => [
    {
      key: 'assignment',
      label: 'حالة التخصيص',
      options: ['جميع العملاء', 'العملاء المخصصين', 'العملاء غير المخصصين'],
      selected: this.state.assignmentFilter(),
    },
  ]);

  constructor(
    private distributionService: DistributionService,
    private notify: NotifyDialogService
  ) {
    // Initialize handlers
    this.filterHandler = new DistributionFilterHandler(
      this.state,
      this.distributionService,
      this.notify
    );
    this.assignmentHandler = new DistributionAssignmentHandler(
      this.state,
      this.distributionService,
      this.notify
    );
    this.dragDropHandler = new DistributionDragDropHandler(
      this.state,
      this.assignmentHandler,
      this.notify
    );
  }

  ngOnInit(): void {
    this.filterHandler.loadTeleSalse();
    this.filterHandler.loadLeads();
  }

  // ========== Event Handlers ==========
  onSearchChange(searchTerm: string): void {
    this.filterHandler.onSearchChange(searchTerm);
  }

  onEmployeeSelected(selectedName: string): void {
    this.state.selectedClient.set(selectedName);
    const employee =
      this.state.teleSalseList().find((emp) => emp.name === selectedName) ||
      null;
    this.state.selectedEmployee.set(employee);
  }

  // ========== Assignment Methods ==========
  onItemUnassign(item: any): void {
    this.assignmentHandler.unassignCustomer(item);
  }

  onConfirmAssignment(): void {
    this.assignmentHandler.confirmAssignment();
    // Reload leads after successful assignment
    setTimeout(() => {
      this.filterHandler.loadLeads();
    }, 100);
  }

  // ========== Drag and Drop Methods ==========
  onDragOver(event: DragEvent): void {
    this.dragDropHandler.onDragOver(event);
  }

  onDragLeave(event: DragEvent): void {
    this.dragDropHandler.onDragLeave(event);
  }

  onDrop(event: DragEvent): void {
    this.dragDropHandler.onDrop(event);
  }

  // ========== Filter Dropdown Methods ==========
  selectOption(option: string, key: string): void {
    if (key === 'assignment') {
      this.filterHandler.onAssignmentFilterChange(option);
    }
  }

  // ========== Table Row Selection Methods ==========
  onRowSelectionChange(event: { row: any; selected: boolean }): void {
    if (event.selected) {
      const currentSelected = this.state.selectedRows();
      if (!currentSelected.find((row) => row.id === event.row.id)) {
        this.state.selectedRows.update((rows) => [...rows, event.row]);
      }
    } else {
      this.state.selectedRows.update((rows) =>
        rows.filter((row) => row.id !== event.row.id)
      );
    }
  }

  onSelectAllChange(selectAll: boolean): void {
    if (selectAll) {
      const leadsList = this.state.leadsList();
      const currentSelected = this.state.selectedRows();
      const newSelections = leadsList.filter(
        (row) =>
          !currentSelected.some((selectedRow) => selectedRow.id === row.id)
      );
      this.state.selectedRows.update((rows) => [...rows, ...newSelections]);
    } else {
      this.state.selectedRows.set([]);
    }
  }

  // ========== Sidebar Methods ==========
  toggleSidebar(): void {
    this.state.isSidebarCollapsed.update((collapsed) => !collapsed);
  }

  // ========== Pagination Methods ==========
  onPageChange(event: any): void {
    this.filterHandler.onPageChange(event.pageIndex);
  }

  onPageSizeChange(newPageSize: number): void {
    this.filterHandler.onPageSizeChange(newPageSize);
  }
}
