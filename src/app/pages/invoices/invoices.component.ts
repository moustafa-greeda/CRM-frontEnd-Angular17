import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IGetAllInvoiceDataItem } from '../../core/Models/invoices/Invoice';
import { InvoiceQueryParams } from '../../pages/pages-accountant/invoices/invoices.service';
import { InvoicesDataService } from './services/invoices-data.service';
import { InvoicesPaymentService } from './services/invoices-payment.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CountCardComponent } from '../../shared/components/count-card/count-card.component';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { SearchInputComponent } from '../../shared/ui/search-input/search-input.component';
import { TableComponent } from '../../shared/components/table/table.component';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    PageHeaderComponent,
    CountCardComponent,
    DropdownComponent,
    SearchInputComponent,
    TableComponent,
  ],
  templateUrl: './invoices.component.html',
  styleUrls: [
    './invoices.component.css',
    '../../pages/pages-accountant/invoices/invoices.component.css',
  ],
  // ⚡ تحسين الأداء - Change Detection على الـ Signals فقط
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesComponent implements OnInit {
  // UI State
  readonly pageTitle = 'الفواتير';
  readonly breadcrumb = [
    { label: 'الرئيسية', link: '/dashboard/accountant' },
    { label: 'الفواتير', link: '/dashboard/accountant/invoices' },
  ];
  readonly searchPlaceholder = 'ابحث عن فاتورة';
  readonly paymentMethods: string[] = [
    'جميع الطرق',
    'نقدي',
    'تحويل بنكي',
    'بطاقة ائتمان',
  ];

  // ========== البيانات ==========
  invoiceList = signal<IGetAllInvoiceDataItem[]>([]);
  filteredInvoices = signal<IGetAllInvoiceDataItem[]>([]);
  selectedRows = signal<IGetAllInvoiceDataItem[]>([]);

  // ========== الفلاتر ==========
  lastSearchTerm = signal<string>('');
  selectedPaymentMethod = signal<string>('');
  fromDate = signal<string>('');
  toDate = signal<string>('');

  // ========== الـ Pagination ==========
  pageIndex = signal<number>(1);
  pageSize = signal<number>(10);
  totalCount = signal<number>(0);

  // ⚡ Loading state
  private _isLoadingInvoices = signal<boolean>(false);
  readonly isLoadingInvoicesDirect = computed(() => this._isLoadingInvoices());
  isInitialLoad = signal<boolean>(true);
  isLoadingStats = signal<boolean>(true);

  // Filter state
  hasActiveFilter = signal<boolean>(false);

  // ========== Computed Signals ==========
  readonly statsCards = this.dataService.statsCards;

  readonly totalPages = computed(() => {
    const pages = Math.ceil(this.totalCount() / this.pageSize());
    return pages > 0 ? pages : 0;
  });

  readonly currentPage = computed(() => this.pageIndex());

  readonly hasActiveSearchTerm = computed(() => {
    const term = this.lastSearchTerm();
    return !!term && term.trim().length > 0;
  });

  readonly hasNoInvoices = computed(
    () => this.isInitialLoad() === false && this.filteredInvoices().length === 0
  );

  readonly isLoadingInvoices = computed(
    () => this.isInitialLoad() && this._isLoadingInvoices()
  );

  readonly hasData = computed(() => {
    // Enable search if we have data or are still loading
    // Disable only if we've finished loading and have no data
    return this.isInitialLoad() || this.totalCount() > 0;
  });

  readonly tableColumns = computed(() => [
    { key: 'clientName', header: 'اسم العميل' },
    { key: 'clientEmail', header: 'البريد الإلكتروني' },
    { key: 'clientPhone', header: 'رقم الهاتف' },
    { key: 'totalprices', header: 'المبلغ الكلي' },
    { key: 'paymentMethodName', header: 'طريقة الدفع' },
    { key: 'paidAmount', header: 'المبلغ المدفوع' },
    { key: 'remaining', header: 'المبلغ المتبقي' },
    { key: 'paymentStatus', header: 'حالة الدفع' },
    {
      key: 'createdAt',
      header: 'تاريخ الإصدار',
      formatter: 'datetime' as const,
    },
    { key: 'actions', header: 'الإجراءات' },
  ]);

  readonly paymentsCashColumns = computed(() => [
    { key: 'invoiceId', header: 'رقم الفاتورة' },
    { key: 'amountPaid', header: 'المبلغ المدفوع' },
    { key: 'cashReceiptNumber', header: 'رقم الإيصال' },
    { key: 'cashReceivedBy', header: 'المستلم بواسطة' },
    {
      key: 'paymentDate',
      header: 'تاريخ الدفع',
      formatter: 'datetime' as const,
    },
  ]);

  readonly paymentsBankTransferColumns = computed(() => [
    { key: 'invoiceId', header: 'رقم الفاتورة' },
    { key: 'amountPaid', header: 'المبلغ المدفوع' },
    { key: 'accountName', header: 'اسم الحساب' },
    { key: 'accountNumber', header: 'رقم الحساب' },
    { key: 'bankName', header: 'اسم البنك' },
    { key: 'swiftCode', header: 'رمز البنك' },
    {
      key: 'paymentDate',
      header: 'تاريخ الدفع',
      formatter: 'datetime' as const,
    },
  ]);

  readonly paymentsVisaColumns = computed(() => [
    { key: 'invoiceId', header: 'رقم الفاتورة' },
    { key: 'amountPaid', header: 'المبلغ المدفوع' },
    { key: 'visaCardNumber', header: 'رقم البطاقة' },
    { key: 'visaOwnerName', header: 'اسم صاحب البطاقة' },
    { key: 'authorizationCode', header: 'رمز التحقق' },
    { key: 'transferReceiptNumber', header: 'رقم الحوالة' },
    {
      key: 'paymentDate',
      header: 'تاريخ الدفع',
      formatter: 'datetime' as const,
    },
  ]);

  // Payment service computed signals
  readonly showTablePayments = this.paymentService.showPayments$;
  readonly cashPayments = computed(() => this.paymentService.getCashPayments());
  readonly bankTransferPayments = computed(() =>
    this.paymentService.getBankTransferPayments()
  );
  readonly visaPayments = computed(() => this.paymentService.getVisaPayments());
  readonly hasCashPayments = computed(() =>
    this.paymentService.hasCashPayments()
  );
  readonly hasBankTransferPayments = computed(() =>
    this.paymentService.hasBankTransferPayments()
  );
  readonly hasVisaPayments = computed(() =>
    this.paymentService.hasVisaPayments()
  );

  filterForm!: FormGroup;

  constructor(
    private dataService: InvoicesDataService,
    private paymentService: InvoicesPaymentService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadAllStats();
    this.initializeFilterForm();
    this.loadInvoices();
  }

  // ==========================================================
  // 📥 تحميل البيانات
  // ==========================================================
  loadInvoices(overrides: Partial<InvoiceQueryParams> = {}): void {
    // ✅ Prevent duplicate API calls if already loading
    if (this._isLoadingInvoices()) {
      return;
    }

    this._isLoadingInvoices.set(true);

    const query: InvoiceQueryParams = {
      clientName: this.lastSearchTerm() || undefined,
      pageIndex: overrides.pageIndex ?? this.pageIndex(),
      pageSize: overrides.pageSize ?? this.pageSize(),
      ...overrides,
    };

    // Add date filters
    const fromDateValue = this.fromDate() || overrides.fromDate;
    const toDateValue = this.toDate() || overrides.toDate;
    if (fromDateValue) {
      query.fromDate = fromDateValue;
    }
    if (toDateValue) {
      query.toDate = toDateValue;
    }

    // Add payment method filter
    const paymentMethodValue = this.getPaymentMethodValue(
      this.selectedPaymentMethod()
    );
    if (paymentMethodValue !== undefined) {
      query.paymentMethod = paymentMethodValue;
    }

    this.dataService.loadInvoices(query).subscribe({
      next: (response) => {
        this.invoiceList.set(response.invoices);
        this.filteredInvoices.set(response.invoices);
        this.totalCount.set(response.totalCount);
        this._isLoadingInvoices.set(false);

        if (this.isInitialLoad()) {
          this.isInitialLoad.set(false);
        }
      },
      error: () => {
        this.invoiceList.set([]);
        this.filteredInvoices.set([]);
        this.totalCount.set(0);
        this._isLoadingInvoices.set(false);

        if (this.isInitialLoad()) {
          this.isInitialLoad.set(false);
        }
      },
    });
  }

  loadAllStats(): void {
    this.isLoadingStats.set(true);
    this.dataService.loadAllStats().subscribe({
      next: () => {
        this.isLoadingStats.set(false);
      },
      error: () => {
        this.isLoadingStats.set(false);
      },
    });
  }

  // ==========================================================
  // 🔍 البحث والفلترة
  // ==========================================================
  onSearch(searchTerm: string): void {
    this.pageIndex.set(1);
    this.lastSearchTerm.set(searchTerm || '');

    if (!searchTerm || !searchTerm.trim()) {
      this.hasActiveFilter.set(false);
      this.clearSummaryFilter();
      this.loadInvoices({ pageIndex: 1 });
      return;
    }

    this.hasActiveFilter.set(true);
    this.loadInvoices({ clientName: searchTerm.trim(), pageIndex: 1 });
  }

  onPaymentMethodChange(value: string): void {
    this.selectedPaymentMethod.set(value);
    this.pageIndex.set(1);

    const paymentMethodValue = this.getPaymentMethodValue(value);
    this.hasActiveFilter.set(true);
    this.loadInvoices({
      pageIndex: 1,
      paymentMethod: paymentMethodValue,
    });
  }

  onDateFilterChange(): void {
    const formValue = this.filterForm?.value || {};
    this.fromDate.set(formValue.fromDate || '');
    this.toDate.set(formValue.toDate || '');
    this.pageIndex.set(1);
    this.hasActiveFilter.set(true);
    this.loadInvoices({ pageIndex: 1 });
  }

  onFilterSubmit(): void {
    this.onDateFilterChange();
  }

  onSummaryRowClick(invoice: IGetAllInvoiceDataItem): void {
    if (!invoice?.id) {
      this.clearSummaryFilter();
      return;
    }

    this.dataService.loadInvoices({ id: invoice.id, pageIndex: 1 }).subscribe({
      next: (response) => {
        this.filteredInvoices.set(response.invoices);
        this.totalCount.set(response.totalCount);
        this.pageIndex.set(1);
        this.hasActiveFilter.set(true);
      },
    });
  }

  clearSummaryFilter(): void {
    this.filteredInvoices.set([...this.invoiceList()]);
    this.totalCount.set(this.invoiceList().length);
    this.pageIndex.set(1);
    this.hasActiveFilter.set(false);
  }

  // ==========================================================
  // 📄 الـ Pagination
  // ==========================================================
  onPageChange(event: PageEvent): void {
    const newPage = event.pageIndex + 1; // MatPaginator is 0-based
    const newPageSize = event.pageSize;

    if (newPage !== this.pageIndex() || newPageSize !== this.pageSize()) {
      this.pageIndex.set(newPage);
      this.pageSize.set(newPageSize);
      this.loadInvoices({
        pageIndex: newPage,
        pageSize: newPageSize,
      });
    }
  }

  onPageSizeChange(pageSize: number): void {
    if (pageSize !== this.pageSize()) {
      this.pageSize.set(pageSize);
      this.pageIndex.set(1);
      this.loadInvoices({
        pageIndex: 1,
        pageSize: pageSize,
      });
    }
  }

  // ==========================================================
  // 💳 Payment Handlers
  // ==========================================================
  onShowTablePayments(row: any): void {
    const invoiceId = typeof row.id === 'string' ? Number(row.id) : row.id;
    if (invoiceId) {
      this.paymentService.showPaymentsTable(invoiceId);
    }
  }

  onHideTablePayments(): void {
    this.paymentService.hidePaymentsTable();
  }

  // ==========================================================
  // 🔧 Utility Methods
  // ==========================================================
  private initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      fromDate: [''],
      toDate: [''],
    });
  }

  private getPaymentMethodValue(value: string): number | undefined {
    if (value === 'نقدي') {
      return 0; // PaymentMethod.Cash
    } else if (value === 'تحويل بنكي') {
      return 1; // PaymentMethod.BankTransfer
    } else if (value === 'بطاقة ائتمان') {
      return 2; // PaymentMethod.Visa
    }
    return undefined; // 'جميع الطرق'
  }
}
