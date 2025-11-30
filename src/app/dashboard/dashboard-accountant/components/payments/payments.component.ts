import { Component } from '@angular/core';

@Component({
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css',
})
export class PaymentsComponent {
  pageTitle = 'الدفعات';
  breadcrumb = [
    { label: 'الرئيسية', link: '/dashboard/accountant' },
    { label: 'الدفعات', link: '/dashboard/accountant/payments' },
  ];
  searchPlaceholder = 'ابحث عن دفعة';
  searchValue = '';
  statusValue = '';
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  payments: any[] = [];
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
    this.searchValue = value;
    this.currentPage = 1;
    // this.loadPayments();
  }
}
