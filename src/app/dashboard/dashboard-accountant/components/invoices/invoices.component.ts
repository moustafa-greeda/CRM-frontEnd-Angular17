import { Component } from '@angular/core';
import {
  IGetAllInvoiceData,
  IGetAllInvoiceDataItem,
  IPayment,
  PaymentMethod,
} from '../../../../core/Models/invoices/Invoice';
import { InvoiceQueryParams, InvoicesService } from './invoices.service';
import { MatDialog } from '@angular/material/dialog';
import {
  PaymentDialogComponent,
  PaymentDialogData,
} from './payment-dialog/payment-dialog.component';
import { PaymentService } from './payment-dialog/payment.service';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.css',
})
export class InvoicesComponent {
  pageTitle = 'الفواتير';
  breadcrumb = [
    { label: 'الرئيسية', link: '/dashboard/accountant' },
    { label: 'الفواتير', link: '/dashboard/accountant/invoices' },
  ];
  searchPlaceholder = 'ابحث عن فاتورة';
  searchValue = '';
  statusValue = '';

  invoices: IGetAllInvoiceDataItem[] = [];
  filteredInvoices: IGetAllInvoiceDataItem[] = [];
  selectedRows: IGetAllInvoiceDataItem[] = [];
  pageSize = 10;
  currentPage = 1;
  totalCount = 0;
  columns: any[] = [];
  summaryColumns: any[] = [];
  noDataMessage = 'اختر فاتورة من القائمة أو استخدم البحث لعرض التفاصيل';
  hasActiveFilter = false;
  showTablePayments: boolean = false;
  payments: IPayment[] = [];
  paymentsCashColumns: any[] = [];
  paymentsBankTransferColumns: any[] = [];
  paymentsVisaColumns: any[] = [];

  currentInvoiceIdForPayments: number | null = null;
  constructor(
    private _invoicesService: InvoicesService,
    private dialog: MatDialog,
    private _paymentService: PaymentService
  ) {}
  ngOnInit(): void {
    this.initializeTableColumns();
    // subscribe to invoices
    this.loadInvoices();
  }
  // ============================ Load Invoices ======================
  loadInvoices(
    overrides: Partial<InvoiceQueryParams> = {},
    updateFiltered: boolean = false
  ): void {
    const query: InvoiceQueryParams = {
      clientName: this.searchValue || undefined,
      pageIndex: overrides.pageIndex ?? this.currentPage,
      pageSize: overrides.pageSize ?? this.pageSize,
      ...overrides,
    };

    this._invoicesService.getAllInvoices(query).subscribe((res) => {
      const payload = res?.data as IGetAllInvoiceData | undefined;
      this.invoices = payload?.items ?? [];

      if (updateFiltered) {
        this.filteredInvoices = [...this.invoices];
        this.totalCount = payload?.totalCount ?? this.filteredInvoices.length;
        this.hasActiveFilter = true;
      } else if (!this.hasActiveFilter) {
        this.filteredInvoices = [];
        this.totalCount = 0;
      }
    });
  }
  // ==================================== initialize table columns ====================================

  private initializeTableColumns(): void {
    this.summaryColumns = [
      { key: 'clientName', header: 'اسم العميل' },
      { key: 'clientEmail', header: 'البريد الإلكتروني' },
    ];
    this.columns = [
      { key: 'clientName', header: 'اسم العميل' },
      { key: 'clientEmail', header: 'البريد الإلكتروني' },
      { key: 'clientPhone', header: 'رقم الهاتف' },
      { key: 'totalprices', header: 'المبلغ الكلي' },
      { key: 'paymentMethod', header: 'طريقة الدفع' },
      { key: 'paidAmount', header: 'المبلغ المدفوع' },
      { key: 'remaining', header: 'المبلغ المتبقي' },
      { key: 'paymentStatus', header: 'حالة الدفع' },
      { key: 'actions', header: 'الإجراءات' },
    ];

    this.paymentsCashColumns = [
      { key: 'id', header: 'رقم الفاتورة' },
      { key: 'amountPaid', header: 'المبلغ المدفوع' },
      { key: 'cashReceiptNumber', header: 'رقم الإيصال' },
      { key: 'cashReceivedBy', header: 'المستلم بواسطة' },
      { key: 'paymentDate', header: 'تاريخ الدفع', formatter: 'datetime' },
    ];
    this.paymentsBankTransferColumns = [
      { key: 'id', header: 'رقم الفاتورة' },
      { key: 'amountPaid', header: 'المبلغ المدفوع' },
      { key: 'accountName', header: 'اسم الحساب' },
      { key: 'accountNumber', header: 'رقم الحساب' },
      { key: 'bankName', header: 'اسم البنك' },
      { key: 'swiftCode', header: 'رمز البنك' },
      { key: 'paymentDate', header: 'تاريخ الدفع', formatter: 'datetime' },
    ];
    this.paymentsVisaColumns = [
      { key: 'id', header: 'رقم الفاتورة' },
      { key: 'amountPaid', header: 'المبلغ المدفوع' },
      { key: 'visaCardNumber', header: 'رقم البطاقة' },
      { key: 'visaOwnerName', header: 'اسم صاحب البطاقة' },
      { key: 'authorizationCode', header: 'رمز التحقق' },
      { key: 'transferReceiptNumber', header: 'رقم الحوالة' },
      { key: 'paymentDate', header: 'تاريخ الدفع', formatter: 'datetime' },
    ];
  }
  // ========================================= Search ====================================
  onSearch(value: string): void {
    const trimmed = (value || '').trim();
    this.searchValue = trimmed;
    this.currentPage = 1;

    if (!trimmed) {
      this.hasActiveFilter = false;
      this.clearSummaryFilter();
      this.loadInvoices();
      return;
    }

    this.loadInvoices({ clientName: trimmed, pageIndex: 1 }, true);
  }
  onOptionSelected(value: string): void {
    this.statusValue = value;
    this.currentPage = 1;
    this.loadInvoices();
  }

  onSummaryRowClick(invoice: IGetAllInvoiceDataItem): void {
    if (!invoice?.id) {
      this.clearSummaryFilter();
      return;
    }
    this._invoicesService
      .getAllInvoices({ id: invoice.id, pageIndex: 1 })
      .subscribe((res) => {
        const payload = res?.data as IGetAllInvoiceData | undefined;
        this.filteredInvoices = payload?.items ?? [];
        this.totalCount = payload?.totalCount ?? this.filteredInvoices.length;
        this.currentPage = 1;
        this.hasActiveFilter = true;
      });
  }

  clearSummaryFilter(): void {
    this.filteredInvoices = [...this.invoices];
    this.totalCount = 0;
    this.currentPage = 1;
  }

  // ==================================== Table Action Handlers ====================================
  onEditDeal(row: IGetAllInvoiceDataItem): void {
    // Use payment dialog for editing invoices
    this.onPayment(row);
  }

  // ==================================== Payment Handler ====================================
  onPayment(row: IGetAllInvoiceDataItem): void {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '90vw',
      maxWidth: '900px',
      height: 'auto',
      maxHeight: '95vh',

      data: {
        invoice: row,
      } as PaymentDialogData,
      disableClose: true,
      panelClass: 'agreement-dialog',
      backdropClass: 'agreement-dialog-backdrop',
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Update invoice with payment information
        const updatedInvoice: IGetAllInvoiceDataItem = {
          ...row,
          paidAmount: result.paidAmount || row.paidAmount,
          remaining: result.remaining || row.remaining,
          paymentMethod: result.paymentMethod || row.paymentMethod,
          paymentStatus:
            result.paidAmount >= row.totalprices ? 'مدفوعة' : 'قيد المراجعة',
        };
        // Update the invoice in the list
        const index = this.invoices.findIndex((inv) => inv.id === row.id);
        if (index !== -1) {
          this.invoices[index] = updatedInvoice;
        }
        // Update filtered invoices if it exists there
        const filteredIndex = this.filteredInvoices.findIndex(
          (inv) => inv.id === row.id
        );
        if (filteredIndex !== -1) {
          this.filteredInvoices[filteredIndex] = updatedInvoice;
        }

        // Reload payments table if it's currently open for this invoice
        if (
          this.showTablePayments &&
          this.currentInvoiceIdForPayments === row.id
        ) {
          const invoiceId =
            typeof row.id === 'string' ? Number(row.id) : row.id;
          if (invoiceId) {
            this.getPaymentByInvoiceId(invoiceId);
          }
        }
      }
    });
  }
  // ==================================== Payment Handler ====================================
  onShowTablePayments(row: any): void {
    this.showTablePayments = true;
    const invoiceId = typeof row.id === 'string' ? Number(row.id) : row.id;
    this.currentInvoiceIdForPayments = invoiceId || null;
    if (invoiceId) {
      this.getPaymentByInvoiceId(invoiceId);
    }
  }
  onHideTablePayments(): void {
    this.showTablePayments = false;
    this.currentInvoiceIdForPayments = null;
  }
  // ==================================== Get Payment By Invoice ID ====================================
  getPaymentByInvoiceId(invoiceId: number): void {
    this._paymentService.getPaymentByInvoiceId(invoiceId).subscribe({
      next: (response) => {
        this.payments = response?.data ?? [];
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.payments = [];
      },
    });
  }

  // Helper methods to filter payments by payment method
  // Handle both enum values and numeric values from API
  private getPaymentMethodValue(payment: IPayment): number {
    // Convert paymentMethod to number if it's an enum or number
    const method = payment.paymentMethod as any;
    if (typeof method === 'number') {
      return method;
    }
    if (typeof method === 'string') {
      const lower = method.toLowerCase();
      if (lower === 'cash') return 0;
      if (lower === 'banktransfer' || lower === 'bank transfer') return 1;
      if (lower === 'visa') return 2;
    }
    return method as number;
  }

  get cashPayments(): IPayment[] {
    return this.payments.filter(
      (payment) => this.getPaymentMethodValue(payment) === PaymentMethod.Cash
    );
  }

  get bankTransferPayments(): IPayment[] {
    return this.payments.filter(
      (payment) =>
        this.getPaymentMethodValue(payment) === PaymentMethod.BankTransfer
    );
  }

  get visaPayments(): IPayment[] {
    return this.payments.filter(
      (payment) => this.getPaymentMethodValue(payment) === PaymentMethod.Visa
    );
  }

  hasCashPayments(): boolean {
    return this.cashPayments.length > 0;
  }

  hasBankTransferPayments(): boolean {
    return this.bankTransferPayments.length > 0;
  }

  hasVisaPayments(): boolean {
    return this.visaPayments.length > 0;
  }

  getPaymentMethodsString(): string {
    return this.payments.map((p) => String(p.paymentMethod)).join(', ');
  }
}
