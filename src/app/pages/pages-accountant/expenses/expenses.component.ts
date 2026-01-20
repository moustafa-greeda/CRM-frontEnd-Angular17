import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExpensesService } from './expenses.service';
import {
  ExpensesQueryParams,
  IAddExpenses,
  IGetAllExpenses,
} from './../../../core/Models/invoices/Invoice';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/components/table/table.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    DropdownComponent,
    TableComponent,
  ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensesComponent implements OnInit {
  pageTitle = 'المصروفات';
  breadcrumb = [
    {
      label: 'الرئيسية',
      route: '/dashboard/accountant',
    },
    {
      label: 'تتبع ومراجعة المصروفات اليومية',
      route: '/dashboard/accountant/expenses',
    },
  ];
  // ========================================
  // Dependency Injection
  // ========================================
  private readonly _expenseService = inject(ExpensesService);
  private readonly _fb = inject(FormBuilder);
  private readonly _notify = inject(NotifyDialogService);

  // ========================================
  // Form Groups
  // ========================================
  expensesForm!: FormGroup;
  searchPlaceholder = 'ابحث عن مصروفات';
  searchForm!: FormGroup;

  // ========================================
  // State Signals
  // ========================================
  readonly expensesData = signal<IGetAllExpenses[]>([]);
  readonly amountSearch = signal<string>('');
  readonly pageSize = signal<number>(10);
  readonly currentPage = signal<number>(1);
  readonly totalCount = signal<number>(0);
  readonly selectedRows = signal<any[]>([]);
  readonly filterValue = signal<string>('');

  // ========================================
  // Static Data
  // ========================================
  readonly expensesColumns: {
    key: string;
    header: string;
    width?: string;
    formatter?: 'date' | 'datetime' | 'booleanYesNo';
  }[] = [
    {
      key: 'expenseName',
      header: 'المصروف',
    },
    {
      key: 'amount',
      header: 'المبلغ',
    },
    {
      key: 'expenseDate',
      header: 'التاريخ',
      formatter: 'date' as const,
    },
  ];

  readonly filterOptions: string[] = [
    'اختر المده',
    'اليوم',
    'الأسبوع الحالي',
    'الشهر الحالي',
  ];

  // Mapping between display labels and API values
  private readonly filterValueMap: Record<string, string> = {
    اليوم: 'today',
    'الأسبوع الحالي': 'thisWeek',
    'الشهر الحالي': 'thisMonth',
  };

  // ========================================
  //  Computed Signals
  // ========================================
  readonly totalAmount = computed(() => {
    return this.expensesData().reduce((total, expense) => {
      const amount = parseFloat(
        expense.amount?.toString().replace(/,/g, '') || '0'
      );
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
  });
  ngOnInit(): void {
    // call initialize form
    this.initializeForm();
    // call get all expenses
    this.getAllExpenses();
  }
  // ================================== get all expenses ======================================
  getAllExpenses(queryParams?: ExpensesQueryParams): void {
    this._expenseService.getExpenses(queryParams).subscribe({
      next: (res) => {
        if (res.succeeded && res.data) {
          this.expensesData.set(res.data.items);
          this.totalCount.set(res.data.totalCount);
        } else {
          this.expensesData.set([]);
          this.totalCount.set(0);
        }
      },
      error: (err) => {
        console.error('Error fetching expenses:', err);
        this.expensesData.set([]);
        this.totalCount.set(0);
      },
    });
  }
  //===================================== form add expenses builder ======================================
  private initializeForm(): void {
    this.expensesForm = this._fb.group({
      expenseName: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      expenseDate: ['', [Validators.required]],
    });
    // ----------------------------------- search form builder -------------------------------------
    this.searchForm = this._fb.group({
      expenseName: [''],
      amount: [''],
      datefrom: [''],
      dateTo: [''],
    });
  }
  // ================================== submit form ======================================
  onExpensesSubmit(): void {
    // Mark all fields as touched to show validation errors
    if (this.expensesForm.invalid) {
      Object.keys(this.expensesForm.controls).forEach((key) => {
        this.expensesForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.expensesForm.valid) {
      const formValue = this.expensesForm.value;
      const data: IAddExpenses = {
        expenseName: formValue.expenseName,
        amount: Number(formValue.amount),
        expenseDate: formValue.expenseDate,
      };

      this._expenseService.addExpenses(data).subscribe({
        next: (res) => {
          if (res.succeeded) {
            this._notify.success({
              title: 'تم الحفظ',
              description: 'تم إضافة المصروف بنجاح',
            });
            // Reset form after successful submission
            this.expensesForm.reset();
            // Reload expenses list
            this.getAllExpenses();
          } else {
            this._notify.error({
              title: 'خطأ',
              description: res.message || 'حدث خطأ أثناء إضافة المصروف',
            });
          }
        },
        error: (err) => {
          console.error('Error adding expenses:', err);
          this._notify.error({
            title: 'خطأ',
            description: err.error?.message || 'حدث خطأ أثناء إضافة المصروف',
          });
        },
      });
    }
  }
  // ================================== search form ======================================
  onSearch(event: any): void {
    event.preventDefault();
    this.onSearchSubmit();
  }
  // ================================== submit search form ======================================
  onSearchSubmit(): void {
    const formValue = this.searchForm.value;
    const queryParams: ExpensesQueryParams = {
      pageIndex: 1,
      pageSize: this.pageSize(),
    };

    // Add search parameters if they have values
    if (formValue.expenseName && formValue.expenseName.trim()) {
      queryParams.expenseName = formValue.expenseName.trim();
    }

    if (formValue.datefrom) {
      queryParams.fromDate = formValue.datefrom;
    }
    if (formValue.amount && formValue.amount.trim()) {
      queryParams.amount = formValue.amount.trim();
    }

    if (formValue.dateTo) {
      queryParams.toDate = formValue.dateTo;
    }

    this.currentPage.set(1);
    this.getAllExpenses(queryParams);
  }

  // ================================== Filter Change Handler ======================================
  onFilterChange(value: string): void {
    this.filterValue.set(value);
    const apiValue = this.filterValueMap[value] || '';

    // Reset all date filters
    const queryParams: ExpensesQueryParams = {
      pageIndex: 1,
      pageSize: this.pageSize(),
    };

    // Apply the appropriate filter based on selected value
    if (apiValue === 'today') {
      queryParams.dayFilter = 'today';
    } else if (apiValue === 'thisWeek') {
      queryParams.weekFilter = 'thisWeek';
    } else if (apiValue === 'thisMonth') {
      queryParams.monthFilter = 'thisMonth';
    }

    // If no filter selected, clear all filters
    if (!apiValue) {
      // Just reload without filters
      this.getAllExpenses({ pageIndex: 1, pageSize: this.pageSize() });
      return;
    }

    this.currentPage.set(1);
    this.getAllExpenses(queryParams);
  }

  // ================================== Pagination Handlers ======================================
  onPageChange(event: any): void {
    this.currentPage.set(event.pageIndex + 1);
    const queryParams: ExpensesQueryParams = {
      pageIndex: event.pageIndex + 1,
      pageSize: event.pageSize || this.pageSize(),
    };
    this.getAllExpenses(queryParams);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    const queryParams: ExpensesQueryParams = {
      pageIndex: 1,
      pageSize: size,
    };
    this.getAllExpenses(queryParams);
  }
}
