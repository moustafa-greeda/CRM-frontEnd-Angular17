import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InvoicesWorkOrdersService } from './invoicesWorkOrders.service';
import {
  IAccountAssignment,
  Iinvoice,
} from '../../../../core/Models/invoices/Invoice';
import { InvoiceWorkOrdersDialogComponent } from './invoice-work-orders-dialog/invoice-work-orders-dialog.component';

@Component({
  selector: 'app-invoices',
  templateUrl: './InvoiceWorkOrders.component.html',
  styleUrls: [
    './InvoiceWorkOrders.component.css',
    '../../../../dashboard/sharedStyleDashboard.css',
  ],
})
export class InvoiceWorkOrdersComponent implements OnInit {
  constructor(
    private InvoicesWorkOrdersService: InvoicesWorkOrdersService,
    private dialog: MatDialog
  ) {}
  pageTitle = 'الفواتير';
  breadcrumb = [
    { label: 'الرئيسية' },
    { label: 'اوامر التشغيل', link: '/dashboard/accountant/invoices' },
  ];
  companyColumns: Array<{ key: string; header: string; width?: string }> = [];
  companyData: Iinvoice[] = [];
  selectedRows: Iinvoice[] = [];
  pageSize = 10;
  currentPage = 1;
  totalCount = 0;

  searchPlaceholder = 'ابحث عن فاتورة';
  searchValue = '';
  statusValue = '';

  // stats: any[] = [
  //   {
  //     title: 'إجمالي الفواتير',
  //     count: 10,
  //     icon: 'bi-file-earmark-text-fill',
  //   },
  //   {
  //     title: 'الفواتير المدفوعة',
  //     count: 10,
  //     icon: 'bi-check-circle-fill',
  //   },
  //   {
  //     title: 'الفواتير غير المدفوعة',
  //     count: 10,
  //     icon: 'bi-check-circle-fill',
  //   },
  //   {
  //     title: 'الفواتير الملغاة',
  //     count: 10,
  //     icon: 'bi-check-circle-fill',
  //   },
  // ];

  accountAssignments: IAccountAssignment[] = [];
  loading = false;

  ngOnInit(): void {
    this.initializeTableColumns();
    this.loadAccountAssignments();
  }

  // ============================ Load Account Assignments ======================
  loadAccountAssignments(): void {
    this.loading = true;
    this.InvoicesWorkOrdersService.getAllAccountAssignments().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.accountAssignments = response.data;
          this.totalCount = response.data.length;
          // Map API data to table format if needed
          this.mapAccountAssignmentsToTableData();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading account assignments:', error);
        this.loading = false;
      },
    });
  }

  // Map API response to table data format
  private mapAccountAssignmentsToTableData(): void {
    this.companyData = this.accountAssignments.map((assignment) => ({
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
      amountDisplay: `${assignment.budget} ${assignment.currncy}`,
      status: assignment.isInWorkOrder
        ? ('قيد المراجعة' as const)
        : ('غير مدفوعة' as const),
    }));
  }

  private initializeTableColumns(): void {
    this.companyColumns = [
      { key: 'clientName', header: 'اسم العميل' },
      { key: 'clientPhone', header: 'رقم الهاتف' },
      { key: 'clientEmail', header: 'البريد الإلكتروني' },
      { key: 'issueDate', header: 'تاريخ الإصدار' },
      { key: 'budget', header: 'المبلغ', width: '70px' },
      { key: 'currncy', header: 'العملة', width: '70px' },
      // { key: 'status', header: 'الحالة' },
      { key: 'actions', header: 'الإجراءات' },
    ];
  }

  onSearch(value: string): void {
    this.searchValue = value;
  }
  onOptionSelected(value: string): void {
    this.statusValue = value;
  }
  // ============================  Add button ======================
  onAddClick(row: any): void {
    const dialogRef = this.dialog.open(InvoiceWorkOrdersDialogComponent, {
      width: '1000px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'agreement-dialog',
      data: {
        invoice: null,
        isEdit: false,
        assignmentId: row?.invoiceNumber
          ? Number(row.invoiceNumber)
          : undefined,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Invoice data:', result);
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
