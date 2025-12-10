import { Component } from '@angular/core';
import { ExpensesService } from './expenses.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IGetAllExpenses } from './../../../../core/Models/invoices/Invoice';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
export class ExpensesComponent {
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
    private _fb: FormBuilder
  ) {}
  ngOnInit(): void {
    // call initialize form
    this.initializeForm();
    // call get all expenses
    this.getAllExpenses();
  }
  // ================================== get all expenses ======================================
  getAllExpenses(): void {
    this._expenseService.getExpenses().subscribe({
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
  //===================================== form builder ======================================
  private initializeForm(): void {
    this.expensesForm = this._fb.group({
      expenseName: ['', [Validators.required]],
      amount: ['', [Validators.required]],
      expenseDate: ['', [Validators.required]],
    });

    this.searchForm = this._fb.group({
      datefrom: [''],
      dateTo: [''],
    });
  }
  // ================================== submit form ======================================
  onExpensesSubmit(): void {
    if (this.expensesForm.valid) {
      console.log(this.expensesForm.value);
    }
  }
  // ================================== search form ======================================
  onSearch(event: any): void {
    console.log(event);
  }
  // ================================== submit search form ======================================
  onSearchSubmit(): void {
    if (this.searchForm.valid) {
      console.log(this.searchForm.value);
    }
  }
}
