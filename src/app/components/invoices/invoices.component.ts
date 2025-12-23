import { Component } from '@angular/core';
import {
  IGetAllInvoiceData,
  IGetAllInvoiceDataItem,
  IPayment,
  PaymentMethod,
} from './../../core/Models/invoices/Invoice';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  InvoiceQueryParams,
  InvoicesService,
} from '../../dashboard/dashboard-accountant/components/invoices/invoices.service';
import { PaymentService } from '../../dashboard/dashboard-accountant/components/invoices/payment-dialog/payment.service';
import { forkJoin } from 'rxjs';
import { InvoicesAdminService } from './invoices-admin.service';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: [
    './invoices.component.css',
    '../../dashboard/dashboard-accountant/components/invoices/invoices.component.css',
  ],
})
export class InvoicesComponent {
  pageTitle = 'الفواتير';
  breadcrumb = [
    { label: 'الرئيسية', link: '/dashboard/accountant' },
    { label: 'الفواتير', link: '/dashboard/accountant/invoices' },
  ];
  stats: any[] = [];
  searchPlaceholder = 'ابحث عن فاتورة';
  searchValue = '';
  statusValue = '';
  paymentMethod = '';
  paymentMethods: string[] = [
    'جميع الطرق',
    'نقدي',
    'تحويل بنكي',
    'بطاقة ائتمان',
  ];

  invoices: IGetAllInvoiceDataItem[] = [];
  filteredInvoices: IGetAllInvoiceDataItem[] = [];
  selectedRows: IGetAllInvoiceDataItem[] = [];
  pageSize = 10;
  currentPage = 1;
  totalCount = 0;
  columns: any[] = [];
  summaryColumns: any[] = [];
  noDataMessage = '  استخدم البحث لعرض التفاصيل';
  hasActiveFilter = false;
  showTablePayments: boolean = false;
  payments: IPayment[] = [];
  paymentsCashColumns: any[] = [];
  paymentsBankTransferColumns: any[] = [];
  paymentsVisaColumns: any[] = [];

  currentInvoiceIdForPayments: number | null = null;
  filterForm!: FormGroup;

  constructor(
    private _invoicesService: InvoicesService,
    private _invoicesAdminService: InvoicesAdminService,
    private _paymentService: PaymentService,
    private _fb: FormBuilder
  ) {}
  ngOnInit(): void {
    // ==================================== Get Stats ====================================
    forkJoin({
      totalInvoices: this._invoicesAdminService.getTotalInvoicesCard(),
      totalPaidInvoices: this._invoicesAdminService.getTotalPaidInvoicesCard(),
      totalUnpaidInvoices:
        this._invoicesAdminService.getTotalUnpaidInvoicesCard(),
    }).subscribe({
      next: (res) => {
        this.stats = [
          {
            title: 'إجمالي الفواتير',
            count: res.totalInvoices?.data || 0,
            icon: 'bi bi-receipt',
          },
          {
            title: 'الفواتير المدفوعة',
            count: res.totalPaidInvoices?.data || 0,
            icon: 'bi bi-cash-stack',
          },
          {
            title: 'الفواتير غير المدفوعة',
            count: res.totalUnpaidInvoices?.data || 0,
            icon: 'bi bi-hourglass-split',
          },
          {
            title: 'الفواتير الملغاة',
            count: 0,
            icon: 'bi bi-slash-circle',
          },
        ];
      },
    });
    // ==================================== initialize Table Columns ====================================
    this.initializeTableColumns();
    this.initializeFilterForm();
    // subscribe to invoices
    this.loadInvoices();
  }

  // ==================================== Initialize Filter Form ====================================
  private initializeFilterForm(): void {
    this.filterForm = this._fb.group({
      fromDate: [''],
      toDate: [''],
    });
  }
  // ============================ Load Invoices ======================
  loadInvoices(
    overrides: Partial<InvoiceQueryParams> = {},
    updateFiltered: boolean = true
  ): void {
    const formValue = this.filterForm?.value || {};
    const query: InvoiceQueryParams = {
      clientName: this.searchValue || undefined,
      pageIndex: overrides.pageIndex ?? this.currentPage,
      pageSize: overrides.pageSize ?? this.pageSize,
      ...overrides,
    };

    // Add date filters if they have values
    if (formValue.fromDate || overrides.fromDate) {
      query.fromDate = formValue.fromDate || overrides.fromDate;
    }
    if (formValue.toDate || overrides.toDate) {
      query.toDate = formValue.toDate || overrides.toDate;
    }

    this._invoicesService.getAllInvoices(query).subscribe((res) => {
      const payload = res?.data as IGetAllInvoiceData | undefined;
      this.invoices = payload?.items ?? [];

      if (updateFiltered) {
        // Update filteredInvoices when filter is active or when explicitly requested
        this.filteredInvoices = [...this.invoices];
        this.totalCount = payload?.totalCount ?? this.filteredInvoices.length;
        this.hasActiveFilter = true;
      } else if (!this.hasActiveFilter) {
        // When no active filter, show invoices in summary table only
        // Keep filteredInvoices empty for main table
        this.filteredInvoices = [];
        this.totalCount = payload?.totalCount ?? 0;
      } else {
        // Update filteredInvoices and totalCount when hasActiveFilter is true
        // This ensures data is updated when pagination changes
        this.filteredInvoices = [...this.invoices];
        this.totalCount = payload?.totalCount ?? this.filteredInvoices.length;
      }
    });
  }
  // ==================================== initialize table columns ====================================

  private initializeTableColumns(): void {
    this.columns = [
      { key: 'clientName', header: 'اسم العميل' },
      { key: 'clientEmail', header: 'البريد الإلكتروني' },
      { key: 'clientPhone', header: 'رقم الهاتف' },
      { key: 'totalprices', header: 'المبلغ الكلي' },
      { key: 'paymentMethodName', header: 'طريقة الدفع' },
      { key: 'paidAmount', header: 'المبلغ المدفوع' },
      { key: 'remaining', header: 'المبلغ المتبقي' },
      { key: 'paymentStatus', header: 'حالة الدفع' },
      { key: 'createdAt', header: 'تاريخ الإصدار', formatter: 'datetime' },
      { key: 'actions', header: 'الإجراءات' },
    ];

    this.paymentsCashColumns = [
      { key: 'invoiceId', header: 'رقم الفاتورة' },
      { key: 'amountPaid', header: 'المبلغ المدفوع' },
      { key: 'cashReceiptNumber', header: 'رقم الإيصال' },
      { key: 'cashReceivedBy', header: 'المستلم بواسطة' },
      { key: 'paymentDate', header: 'تاريخ الدفع', formatter: 'datetime' },
    ];
    this.paymentsBankTransferColumns = [
      { key: 'invoiceId', header: 'رقم الفاتورة' },
      { key: 'amountPaid', header: 'المبلغ المدفوع' },
      { key: 'accountName', header: 'اسم الحساب' },
      { key: 'accountNumber', header: 'رقم الحساب' },
      { key: 'bankName', header: 'اسم البنك' },
      { key: 'swiftCode', header: 'رمز البنك' },
      { key: 'paymentDate', header: 'تاريخ الدفع', formatter: 'datetime' },
    ];
    this.paymentsVisaColumns = [
      { key: 'invoiceId', header: 'رقم الفاتورة' },
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
    this.totalCount = this.invoices.length;
    this.currentPage = 1;
    this.hasActiveFilter = false;
  }

  // ==================================== Page Change Handler ====================================
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1; // MatPaginator is 0-based, we use 1-based
    this.pageSize = event.pageSize;

    // Reload invoices with new page
    this.loadInvoices(
      {
        pageIndex: this.currentPage,
        pageSize: this.pageSize,
      },
      this.hasActiveFilter
    );
  }

  // ==================================== Page Size Change Handler ====================================
  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 1; // Reset to first page when page size changes

    // Reload invoices with new page size
    this.loadInvoices(
      {
        pageIndex: 1,
        pageSize: this.pageSize,
      },
      this.hasActiveFilter || this.filteredInvoices.length > 0
    );
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
        // Map payments and ensure invoiceId is set
        this.payments = (response?.data ?? []).map((payment) => {
          const mappedPayment = {
            ...payment,
            invoiceId: payment.invoiceId || invoiceId,
          };
          return mappedPayment;
        });
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
    return this.payments
      .filter(
        (payment) => this.getPaymentMethodValue(payment) === PaymentMethod.Cash
      )
      .map((payment) => ({
        ...payment,
        invoiceId:
          payment.invoiceId || this.currentInvoiceIdForPayments || undefined,
      }));
  }

  get bankTransferPayments(): IPayment[] {
    return this.payments
      .filter(
        (payment) =>
          this.getPaymentMethodValue(payment) === PaymentMethod.BankTransfer
      )
      .map((payment) => ({
        ...payment,
        invoiceId:
          payment.invoiceId || this.currentInvoiceIdForPayments || undefined,
      }));
  }

  get visaPayments(): IPayment[] {
    return this.payments
      .filter(
        (payment) => this.getPaymentMethodValue(payment) === PaymentMethod.Visa
      )
      .map((payment) => ({
        ...payment,
        invoiceId:
          payment.invoiceId || this.currentInvoiceIdForPayments || undefined,
      }));
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

  // ==================================== Payment Method Change Handler ====================================
  onPaymentMethodChange(value: string): void {
    this.paymentMethod = value;
    this.currentPage = 1;

    // Map Arabic labels to PaymentMethod enum values
    let paymentMethodValue: number | undefined;
    if (value === 'نقدي') {
      paymentMethodValue = PaymentMethod.Cash;
    } else if (value === 'تحويل بنكي') {
      paymentMethodValue = PaymentMethod.BankTransfer;
    } else if (value === 'بطاقة ائتمان') {
      paymentMethodValue = PaymentMethod.Visa;
    } else {
      paymentMethodValue = undefined; // 'جميع الطرق'
    }

    // Reload invoices with payment method filter
    this.loadInvoices(
      {
        pageIndex: 1,
        paymentMethod: paymentMethodValue,
      },
      true
    );
  }

  // ==================================== Date Filter Change Handler ====================================
  onDateFilterChange(): void {
    this.currentPage = 1;
    this.loadInvoices({ pageIndex: 1 }, true);
  }

  // ==================================== Filter Submit Handler ====================================
  onFilterSubmit(): void {
    this.currentPage = 1;
    this.loadInvoices({ pageIndex: 1 }, true);
  }
}
