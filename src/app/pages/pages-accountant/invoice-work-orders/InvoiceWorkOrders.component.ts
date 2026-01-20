import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { InvoicesWorkOrdersService } from './invoicesWorkOrders.service';
import {
  IAccountAssignment,
  Iinvoice,
} from '../../../core/Models/invoices/Invoice';
import { InvoiceWorkOrdersDialogComponent } from './invoice-work-orders-dialog/invoice-work-orders-dialog.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
// import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/components/table/table.component';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    PageHeaderComponent,
    SearchInputComponent,
    // DropdownComponent,
    TableComponent,
  ],
  templateUrl: './InvoiceWorkOrders.component.html',
  styleUrls: [
    './InvoiceWorkOrders.component.css',
    '../../../dashboard/sharedStyleDashboard.css',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceWorkOrdersComponent implements OnInit {
  // ========================================
  // 🔧 Dependency Injection
  // ========================================
  private readonly InvoicesWorkOrdersService = inject(InvoicesWorkOrdersService);
  private readonly dialog = inject(MatDialog);

  // ========================================
  // State Signals
  // ========================================
  readonly companyData = signal<Iinvoice[]>([]);
  readonly selectedRows = signal<Iinvoice[]>([]);
  readonly pageSize = signal<number>(10);
  readonly currentPage = signal<number>(1);
  readonly totalCount = signal<number>(0);
  readonly searchValue = signal<string>('');
  readonly statusValue = signal<string>('');
  readonly loading = signal<boolean>(false);

  // ========================================
  // Static Data
  // ========================================
  readonly pageTitle = 'الفواتير';
  readonly breadcrumb = [
    { label: 'الرئيسية' },
    { label: 'اوامر التشغيل', link: '/dashboard/accountant/invoices' },
  ];
  readonly searchPlaceholder = 'ابحث عن فاتورة';

  companyColumns: Array<{ key: string; header: string; width?: string }> = [];
  accountAssignments: IAccountAssignment[] = [];

  ngOnInit(): void {
    this.initializeTableColumns();
    this.loadAccountAssignments();
  }

  // ============================ Load Account Assignments ======================
  loadAccountAssignments(): void {
    this.loading.set(true);
    this.InvoicesWorkOrdersService.getAllAccountAssignments().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.accountAssignments = response.data;
          this.totalCount.set(response.data.length);
          // Map API data to table format if needed
          this.mapAccountAssignmentsToTableData();
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading account assignments:', error);
        this.loading.set(false);
      },
    });
  }

  // Map API response to table data format
  private mapAccountAssignmentsToTableData(): void {
    this.companyData.set(
      this.accountAssignments.map((assignment) => ({
      invoiceNumber: assignment.id.toString(),
      clientName: assignment.contactName,
      clientEmail: assignment.contactEmail,
      clientPhone: assignment.contactPhone,
      issueDate: new Date(assignment.createdAt).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }),
      budget: assignment.budget,
      currncy: assignment.currncy,
      name: assignment.name, // Add package name
      amountDisplay: `${assignment.budget} ${assignment.currncy}`,
      status: assignment.isInWorkOrder
        ? ('قيد المراجعة' as const)
        : ('غير مدفوعة' as const),
      }))
    );
  }

  private initializeTableColumns(): void {
    this.companyColumns = [
      { key: 'clientName', header: 'اسم العميل' },
      { key: 'clientPhone', header: 'رقم الهاتف' },
      { key: 'clientEmail', header: 'البريد الإلكتروني' },
      { key: 'issueDate', header: 'تاريخ الإصدار' },
      { key: 'name', header: 'الباقة' },
      { key: 'budget', header: 'المبلغ', width: '70px' },
      { key: 'currncy', header: 'العملة', width: '70px' },
      // { key: 'status', header: 'الحالة' },
      { key: 'actions', header: 'الإجراءات' },
    ];
  }

  onSearch(value: string): void {
    this.searchValue.set(value);
  }
  onOptionSelected(value: string): void {
    this.statusValue.set(value);
  }
  // ============================  Add button ======================
  onAddClick(row: any): void {
    const dialogRef = this.dialog.open(InvoiceWorkOrdersDialogComponent, {
      width: '1000px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'agreement-dialog',
      backdropClass: 'agreement-dialog-backdrop',
      data: {
        invoice: null,
        isEdit: false,
        assignmentId: row?.invoiceNumber
          ? Number(row.invoiceNumber)
          : undefined,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.refresh) {
        // Reload account assignments to reflect the changes
        this.loadAccountAssignments();
      }
    });
  }
  onEditDeal(row: any): void {
    console.log('Edit invoice', row);
  }

  onViewDeal(row: any): void {
    console.log('View invoice', row);
  }
}
