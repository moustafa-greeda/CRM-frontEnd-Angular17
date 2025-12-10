import { Component, OnInit } from '@angular/core';
import { ExpensesService } from './expenses.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ExpensesQueryParams,
  IAddExpenses,
  IGetAllExpenses,
} from './../../../../core/Models/invoices/Invoice';
import { NotifyDialogService } from '../../../../shared/components/notify-dialog-host/notify-dialog.service';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
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
  expensesForm!: FormGroup;
  searchPlaceholder = 'ابحث عن مصروفات';
  searchForm!: FormGroup;
  expensesData: IGetAllExpenses[] = [];
  expensesColumns: {
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
  pageSize = 10;
  currentPage = 1;
  totalCount = 0;
  selectedRows = [];

  constructor(
    private _expenseService: ExpensesService,
    private _fb: FormBuilder,
    private _notify: NotifyDialogService
  ) {}
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
          this.expensesData = res.data.items;
          this.totalCount = res.data.totalCount;
        } else {
          this.expensesData = [];
          this.totalCount = 0;
        }
      },
      error: (err) => {
        console.error('Error fetching expenses:', err);
        this.expensesData = [];
        this.totalCount = 0;
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
      pageSize: this.pageSize,
    };

    // Add search parameters if they have values
    if (formValue.expenseName && formValue.expenseName.trim()) {
      queryParams.expenseName = formValue.expenseName.trim();
    }

    if (formValue.datefrom) {
      queryParams.fromDate = formValue.datefrom;
    }

    if (formValue.dateTo) {
      queryParams.toDate = formValue.dateTo;
    }

    this.currentPage = 1;
    this.getAllExpenses(queryParams);
  }

  // ================================== calculate total amount ======================================
  getTotalAmount(): number {
    return this.expensesData.reduce((total, expense) => {
      const amount = parseFloat(
        expense.amount?.toString().replace(/,/g, '') || '0'
      );
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
  }
}
