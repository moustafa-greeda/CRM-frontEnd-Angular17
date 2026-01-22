import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  IGetAllInvoiceData,
  IGetAllInvoiceDataItem,
  IPayment,
  PaymentMethod,
} from '../../../core/Models/invoices/Invoice';
import { InvoiceQueryParams, InvoicesService } from './invoices.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  PaymentDialogComponent,
  PaymentDialogData,
} from './payment-dialog/payment-dialog.component';
import { PaymentService } from './payment-dialog/payment.service';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { DropdownComponent } from '../../../shared/ui/dropdown/dropdown.component';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatDialogModule,
    PageHeaderComponent,
    SearchInputComponent,
    DropdownComponent,
    TableComponent,
  ],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicesComponent implements OnInit {
  // ========================================
  // Dependency Injection
  // ========================================
  private readonly _invoicesService = inject(InvoicesService);
  private readonly dialog = inject(MatDialog);
  private readonly _paymentService = inject(PaymentService);
  private readonly _fb = inject(FormBuilder);

  // ========================================
  // State Signals
  // ========================================
  readonly invoices = signal<IGetAllInvoiceDataItem[]>([]);
  readonly filteredInvoices = signal<IGetAllInvoiceDataItem[]>([]);
  readonly selectedRows = signal<IGetAllInvoiceDataItem[]>([]);
  readonly pageSize = signal<number>(10);
  readonly currentPage = signal<number>(1);
  readonly totalCount = signal<number>(0);
  readonly searchValue = signal<string>('');
  readonly statusValue = signal<string>('');
  readonly paymentMethod = signal<string>('');
  readonly hasActiveFilter = signal<boolean>(false);
  readonly showTablePayments = signal<boolean>(false);
  readonly payments = signal<IPayment[]>([]);
  readonly currentInvoiceIdForPayments = signal<number | null>(null);

  // ========================================
  // Static Data
  // ========================================
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
  readonly noDataMessage = 'اختر فاتورة من القائمة أو استخدم البحث لعرض التفاصيل';

  columns: any[] = [];
  summaryColumns: any[] = [];
  paymentsCashColumns: any[] = [];
  paymentsBankTransferColumns: any[] = [];
  paymentsVisaColumns: any[] = [];
  filterForm!: FormGroup;

  // ========================================
  // Computed Signals
  // ========================================
  readonly cashPayments = computed(() => {
    return this.payments()
      .filter(
        (payment) => this.getPaymentMethodValue(payment) === PaymentMethod.Cash
      )
      .map((payment) => ({
        ...payment,
        invoiceId:
          payment.invoiceId || this.currentInvoiceIdForPayments() || undefined,
      }));
  });

  readonly bankTransferPayments = computed(() => {
    return this.payments()
      .filter(
        (payment) =>
          this.getPaymentMethodValue(payment) === PaymentMethod.BankTransfer
      )
      .map((payment) => ({
        ...payment,
        invoiceId:
          payment.invoiceId || this.currentInvoiceIdForPayments() || undefined,
      }));
  });

  readonly visaPayments = computed(() => {
    return this.payments()
      .filter(
        (payment) => this.getPaymentMethodValue(payment) === PaymentMethod.Visa
      )
      .map((payment) => ({
        ...payment,
        invoiceId:
          payment.invoiceId || this.currentInvoiceIdForPayments() || undefined,
      }));
  });

  readonly hasCashPayments = computed(() => this.cashPayments().length > 0);
  readonly hasBankTransferPayments = computed(
    () => this.bankTransferPayments().length > 0
  );
  readonly hasVisaPayments = computed(() => this.visaPayments().length > 0);
  ngOnInit(): void {
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
    updateFiltered: boolean = false
  ): void {
    const formValue = this.filterForm?.value || {};
    const query: InvoiceQueryParams = {
      clientName: this.searchValue() || undefined,
      pageIndex: overrides.pageIndex ?? this.currentPage(),
      pageSize: overrides.pageSize ?? this.pageSize(),
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
      this.invoices.set(payload?.items ?? []);

      if (updateFiltered) {
        // Update filteredInvoices when filter is active or when explicitly requested
        this.filteredInvoices.set([...this.invoices()]);
        this.totalCount.set(
          payload?.totalCount ?? this.filteredInvoices().length
        );
        this.hasActiveFilter.set(true);
      } else if (!this.hasActiveFilter()) {
        // When no active filter, show invoices in summary table only
        // Keep filteredInvoices empty for main table
        this.filteredInvoices.set([]);
        this.totalCount.set(payload?.totalCount ?? 0);
      } else {
        // Update filteredInvoices and totalCount when hasActiveFilter is true
        // This ensures data is updated when pagination changes
        this.filteredInvoices.set([...this.invoices()]);
        this.totalCount.set(
          payload?.totalCount ?? this.filteredInvoices().length
        );
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
    this.searchValue.set(trimmed);
    this.currentPage.set(1);

    if (!trimmed) {
      this.hasActiveFilter.set(false);
      this.clearSummaryFilter();
      this.loadInvoices();
      return;
    }

    this.loadInvoices({ clientName: trimmed, pageIndex: 1 }, true);
  }
  onOptionSelected(value: string): void {
    this.statusValue.set(value);
    this.currentPage.set(1);
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
        this.filteredInvoices.set(payload?.items ?? []);
        this.totalCount.set(
          payload?.totalCount ?? this.filteredInvoices().length
        );
        this.currentPage.set(1);
        this.hasActiveFilter.set(true);
      });
  }

  clearSummaryFilter(): void {
    this.filteredInvoices.set([...this.invoices()]);
    this.totalCount.set(this.invoices().length);
    this.currentPage.set(1);
    this.hasActiveFilter.set(false);
  }

  // ==================================== Page Change Handler ====================================
  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex + 1); // MatPaginator is 0-based, we use 1-based
    this.pageSize.set(event.pageSize);

    // Reload invoices with new page
    this.loadInvoices(
      {
        pageIndex: this.currentPage(),
        pageSize: this.pageSize(),
      },
      this.hasActiveFilter()
    );
  }

  // ==================================== Page Size Change Handler ====================================
  onPageSizeChange(pageSize: number): void {
    this.pageSize.set(pageSize);
    this.currentPage.set(1); // Reset to first page when page size changes

    // Reload invoices with new page size
    this.loadInvoices(
      {
        pageIndex: 1,
        pageSize: this.pageSize(),
      },
      this.hasActiveFilter() || this.filteredInvoices().length > 0
    );
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
        const invoices = [...this.invoices()];
        const index = invoices.findIndex((inv) => inv.id === row.id);
        if (index !== -1) {
          invoices[index] = updatedInvoice;
          this.invoices.set(invoices);
        }
        // Update filtered invoices if it exists there
        const filteredInvoices = [...this.filteredInvoices()];
        const filteredIndex = filteredInvoices.findIndex(
          (inv) => inv.id === row.id
        );
        if (filteredIndex !== -1) {
          filteredInvoices[filteredIndex] = updatedInvoice;
          this.filteredInvoices.set(filteredInvoices);
        }

        // Reload payments table if it's currently open for this invoice
        if (
          this.showTablePayments() &&
          this.currentInvoiceIdForPayments() === row.id
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
    this.showTablePayments.set(true);
    const invoiceId = typeof row.id === 'string' ? Number(row.id) : row.id;
    this.currentInvoiceIdForPayments.set(invoiceId || null);
    if (invoiceId) {
      this.getPaymentByInvoiceId(invoiceId);
    }
  }
  onHideTablePayments(): void {
    this.showTablePayments.set(false);
    this.currentInvoiceIdForPayments.set(null);
  }
  // ==================================== Get Payment By Invoice ID ====================================
  getPaymentByInvoiceId(invoiceId: number): void {
    this._paymentService.getPaymentByInvoiceId(invoiceId).subscribe({
      next: (response) => {
        // Map payments and ensure invoiceId is set
        this.payments.set(
          (response?.data ?? []).map((payment) => {
            const mappedPayment = {
              ...payment,
              invoiceId: payment.invoiceId || invoiceId,
            };
            return mappedPayment;
          })
        );
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.payments.set([]);
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

  getPaymentMethodsString(): string {
    return this.payments().map((p) => String(p.paymentMethod)).join(', ');
  }

  // ==================================== Payment Method Change Handler ====================================
  onPaymentMethodChange(value: string): void {
    this.paymentMethod.set(value);
    this.currentPage.set(1);

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
    this.currentPage.set(1);
    this.loadInvoices({ pageIndex: 1 }, true);
  }

  // ==================================== Filter Submit Handler ====================================
  onFilterSubmit(): void {
    this.currentPage.set(1);
    this.loadInvoices({ pageIndex: 1 }, true);
  }
}
