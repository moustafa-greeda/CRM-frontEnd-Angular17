import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CountCardComponent } from '../../../shared/components/count-card/count-card.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
// import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { TableComponent } from '../../../shared/components/table/table.component';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    CountCardComponent,
    SearchInputComponent,
    // DropdownComponent,
    TableComponent,
  ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsComponent implements OnInit {
  // ========================================
  // 📊 State Signals
  // ========================================
  readonly searchValue = signal<string>('');
  readonly statusValue = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalCount = signal<number>(0);
  readonly payments = signal<any[]>([]);

  // ========================================
  // 📑 Static Data
  // ========================================
  readonly pageTitle = 'الدفعات';
  readonly breadcrumb = [
    { label: 'الرئيسية', link: '/dashboard/accountant' },
    { label: 'الدفعات', link: '/dashboard/accountant/payments' },
  ];
  readonly searchPlaceholder = 'ابحث عن دفعة';
  paymentsColumns: any[] = [];

  // ================================== cards stats =====================================

  stats: any[] = [
    {
      title: 'إجمالي الدفعات',
      count: 10,
      icon: 'bi-file-earmark-text-fill',
    },
    {
      title: 'الدفعات المدفوعة',
      count: 10,
      icon: 'bi-check-circle-fill',
    },
    {
      title: 'الدفعات غير المدفوعة',
      count: 10,
      icon: 'bi-check-circle-fill',
    },
    {
      title: 'الدفعات الملغاة',
      count: 10,
      icon: 'bi-check-circle-fill',
    },
  ];
  ngOnInit(): void {
    this.initializeTableColumns();
  }
  initializeTableColumns(): void {
    this.paymentsColumns = [
      { key: 'invoiceId', header: 'رقم الفاتورة' },
      { key: 'paymentMethod', header: 'طريقة الدفع' },
      { key: 'paymentDetails', header: 'تفاصيل الدفع' },
      { key: 'paidAmount', header: 'المبلغ المدفوع' },
      { key: 'remaining', header: 'المبلغ المتبقي' },
      { key: 'paymentStatus', header: 'حالة الدفع' },
      { key: 'paymentDate', header: 'تاريخ الدفع' },
    ];
  }
  // ================================== search =====================================
  onSearch(value: string): void {
    this.searchValue.set(value);
    this.currentPage.set(1);
    // this.loadPayments();
  }
}
