import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IAssignSalse } from './IAssignSalse';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { NoResultsMessageComponent } from '../../../shared/components/no-results-message/no-results-message.component';

@Component({
  selector: 'app-assgin-to-sales',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    SearchInputComponent,
    ButtonComponent,
    TableComponent,
    NoResultsMessageComponent,
  ],
  templateUrl: './assgin-to-sales.component.html',
  styleUrl: './assgin-to-sales.component.css',
})
export class AssginToSalesComponent {
  pageTitle = 'التعيين الي sales';
  breadcrumb = [
    { label: 'الرئيسية', link: '/dashboard/telesales' },
    { label: 'التعيين الي sales', link: '/dashboard/telesales/assignToSales' },
  ];

  columns = [
    { key: 'contactName', header: 'الاسم' },
    { key: 'contactPhone', header: 'رقم الهاتف' },
    { key: 'contactEmail', header: 'البريد الإلكتروني' },
    { key: 'contactAddress', header: 'العنوان' },
    { key: 'contactCity', header: 'المدينة' },
    { key: 'industry', header: 'الصناعة' },
    { key: 'employeeSalse', header: 'الموظف المسؤول' },
    // { key: 'actions', header: 'الاجراءات' },
  ];

  // Employee sales options for dropdown
  employeeSalesOptions = [
    'محمد أحمد محمد',
    'فاطمة علي',
    'محمد خالد حسن',
    'سارة محمود عبدالله',
    'علي يوسف أحمد',
    'مريم سعيد محمد',
    'خالد عمرو إبراهيم',
    'نورا حسن علي',
  ];

  // ======================= Mock Data =======================
  private mockDataArray: IAssignSalse[] = [
    {
      id: 1,
      contactName: 'أحمد محمد علي',
      contactPhone: '01234567890',
      contactEmail: 'ahmed.mohamed@example.com',
      contactAddress: 'شارع النيل، المنصورة',
      contactCity: 'المنصورة',
      industry: 'الصناعة التعدينية',
    },
    {
      id: 2,
      contactName: 'فاطمة أحمد إبراهيم',
      contactPhone: '01123456789',
      contactEmail: 'fatma.ahmed@example.com',
      contactAddress: 'شارع التحرير، القاهرة',
      contactCity: 'القاهرة',
      industry: 'الصناعة التعدينية',
    },
    {
      id: 3,
      contactName: 'محمد خالد حسن',
      contactPhone: '01012345678',
      contactEmail: 'mohamed.khaled@example.com',
      contactAddress: 'شارع الجلاء، الإسكندرية',
      contactCity: 'الإسكندرية',
      industry: 'الالكترونيات',
    },
    {
      id: 4,
      contactName: 'سارة محمود عبدالله',
      contactPhone: '01523456789',
      contactEmail: 'sara.mahmoud@example.com',
      contactAddress: 'شارع السلام، طنطا',
      contactCity: 'طنطا',
      industry: 'المطاعم',
    },
    {
      id: 5,
      contactName: 'علي يوسف أحمد',
      contactPhone: '01234567891',
      contactEmail: 'ali.youssef@example.com',
      contactAddress: 'شارع الجامعة، الزقازيق',
      contactCity: 'الزقازيق',
      industry: 'المطاعم',
    },
    {
      id: 6,
      contactName: 'مريم سعيد محمد',
      contactPhone: '01112345678',
      contactEmail: 'mariam.said@example.com',
      contactAddress: 'شارع الشهداء، أسيوط',
      contactCity: 'أسيوط',
      industry: 'المطاعم',
    },
    {
      id: 7,
      contactName: 'خالد عمرو إبراهيم',
      contactPhone: '01023456789',
      contactEmail: 'khaled.amr@example.com',
      contactAddress: 'شارع النصر، المنيا',
      contactCity: 'المنيا',
      industry: 'الالكترونيات',
    },
    {
      id: 8,
      contactName: 'نورا حسن علي',
      contactPhone: '01223456789',
      contactEmail: 'nora.hassan@example.com',
      contactAddress: 'شارع الحرية، دمياط',
      contactCity: 'دمياط',
    },
    {
      id: 9,
      contactName: 'يوسف محمود خالد',
      contactPhone: '01134567890',
      contactEmail: 'youssef.mahmoud@example.com',
      contactAddress: 'شارع الفردوس، بنها',
      contactCity: 'بنها',
      industry: 'المطاعم',
    },
    {
      id: 10,
      contactName: 'ليلى أحمد فؤاد',
      contactPhone: '01034567891',
      contactEmail: 'laila.ahmed@example.com',
      contactAddress: 'شارع النهضة، كفر الشيخ',
      contactCity: 'كفر الشيخ',
      industry: 'الصناعة',
    },
  ];

  // ======================= State (Signals) =======================
  searchTerm = signal('');
  pageIndex = signal(1);
  pageSize = signal(10);

  isLoading = signal(false);

  // ======================= Derived State =======================
  hasActiveFilters = computed(() => {
    return this.searchTerm().trim().length > 0;
  });

  hasActiveSearchTerm = computed(() => {
    return this.searchTerm().trim().length > 0;
  });

  // ======================= Filtered Data =======================
  filteredLeadsList = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    if (!search) {
      return this.mockDataArray;
    }
    return this.mockDataArray.filter(
      (item) =>
        item.contactName?.toLowerCase().includes(search) ||
        item.contactPhone?.includes(search) ||
        item.contactEmail?.toLowerCase().includes(search) ||
        item.contactCity?.toLowerCase().includes(search) ||
        item.industry?.toLowerCase().includes(search)
    );
  });

  // ======================= Paginated Data =======================
  mockData = computed(() => {
    const filtered = this.filteredLeadsList();
    const start = (this.pageIndex() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return filtered.slice(start, end);
  });

  totalCount = computed(() => this.filteredLeadsList().length);

  hasNoLeads = computed(() => {
    return !this.isLoading() && this.filteredLeadsList().length === 0;
  });

  // ======================= UI Handlers =======================
  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.pageIndex.set(1);
  }

  onPageChange(event: any): void {
    this.pageIndex.set(event.pageIndex + 1);
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
  }

  resetFilters(): void {
    this.searchTerm.set('');
    this.pageIndex.set(1);
  }

  onEmployeeSalesChange(event: {
    row: IAssignSalse;
    employeeSales: string;
  }): void {
    // Update the row data with the new employee sales value
    const rowIndex = this.mockDataArray.findIndex(
      (item) => item.id === event.row.id
    );
    if (rowIndex !== -1) {
      this.mockDataArray[rowIndex].employeeSalse = event.employeeSales;
    }
  }
}
