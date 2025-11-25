import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InvoicesService } from './invoices.service';
import { Iinvoice } from '../../core/Models/invoices/Invoice';
import { InvoiceDialogComponent } from './invoice-dialog/invoice-dialog.component';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: [
    './invoices.component.css',
    '../../dashboard/sharedStyleDashboard.css',
  ],
})
export class InvoicesComponent implements OnInit {
  constructor(
    private _invoicesService: InvoicesService,
    private dialog: MatDialog
  ) {}
  pageTitle = 'الفواتير';
  breadcrumb = [
    { label: 'الرئيسية', link: '/dashboard/admin' },
    { label: 'الفواتير', link: '/dashboard/admin/invoices' },
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

  stats: any[] = [
    {
      title: 'إجمالي الفواتير',
      count: 10,
      icon: 'bi-file-earmark-text-fill',
    },
    {
      title: 'الفواتير المدفوعة',
      count: 10,
      icon: 'bi-check-circle-fill',
    },
    {
      title: 'الفواتير غير المدفوعة',
      count: 10,
      icon: 'bi-check-circle-fill',
    },
    {
      title: 'الفواتير الملغاة',
      count: 10,
      icon: 'bi-check-circle-fill',
    },
  ];

  ngOnInit(): void {
    this.initializeTableColumns();
  }

  private initializeTableColumns(): void {
    this.companyColumns = [
      { key: 'clientName', header: 'اسم العميل' },
      { key: 'clientEmail', header: 'البريد الإلكتروني' },
      { key: 'clientPhone', header: 'رقم الهاتف' },
      { key: 'issueDate', header: 'تاريخ الإصدار' },
      { key: 'budget', header: 'المبلغ', width: '70px' },
      { key: 'currency', header: 'العملة' },
      { key: 'status', header: 'الحالة' },
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
    const dialogRef = this.dialog.open(InvoiceDialogComponent, {
      width: '1000px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'agreement-dialog',
      data: {
        invoice: null,
        isEdit: false,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Invoice data:', result);
        // Handle invoice creation/update here
        // You can call your service to save the invoice
        // this._invoicesService.createInvoice(result).subscribe(...)
      }
    });
  }
  onEditDeal(row: any): void {
    console.log('Edit invoice', row);
  }

  onDeleteDeal(row: any): void {
    console.log('Delete invoice', row);
  }

  onViewDeal(row: any): void {
    console.log('View invoice', row);
  }
}
