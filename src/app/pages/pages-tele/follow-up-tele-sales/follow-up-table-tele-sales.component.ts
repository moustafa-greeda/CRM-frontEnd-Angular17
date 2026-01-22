import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, tap, finalize } from 'rxjs';

import { FollowUpTableTeleSalseService } from './follow-up-table-tele-salse.service';
import { IFollowUp } from './interfaces/IFollowUp';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { DropdownComponent } from '../../../shared/ui/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { NoResultsMessageComponent } from '../../../shared/components/no-results-message/no-results-message.component';

@Component({
  selector: 'app-follow-up-table-tele-sales',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    SearchInputComponent,
    DropdownComponent,
    ButtonComponent,
    TableComponent,
    NoResultsMessageComponent,
  ],
  templateUrl: './follow-up-table-tele-sales.component.html',
  styleUrl: './follow-up-table-tele-sales.component.css',
})
export class FollowUpTeleSalesComponent {
  // ======================= Static UI =======================
  pageTitle = 'المتابعة';
  breadcrumb = [
    { label: 'الرئيسية', link: '/dashboard/telesales' },
    { label: 'المتابعة', link: '/dashboard/telesales/follow-up-tele' },
  ];

  dateFilterOptions = [
    { label: 'اليوم', value: 0 },
    { label: 'الاسبوع', value: 1 },
    { label: 'الشهر', value: 2 },
  ];

  columns = [
    { key: 'contactName', header: 'الاسم' },
    { key: 'actionType', header: 'نوع المتابعه' },
    { key: 'actionText', header: 'الملاحظة' },
    { key: 'dateFollowUp', header: 'الحالة' },
    { key: 'actions', header: 'الاجراءات' },
  ];

  // ======================= State (Signals) =======================
  searchTerm = signal('');
  dateFilter = signal<number>(0);
  pageIndex = signal(1);
  pageSize = signal(10);

  isLoading = signal(false);

  // ======================= Derived State =======================
  hasActiveFilters = computed(() => {
    return this.searchTerm().trim().length > 0 || this.dateFilter() !== 0;
  });

  hasActiveSearchTerm = computed(() => {
    return this.searchTerm().trim().length > 0;
  });

  hasNoLeads = computed(() => {
    return !this.isLoading() && this.leadsList().length === 0;
  });

  query = computed(() => ({
    search: this.searchTerm(),
    date: this.dateFilter(),
    page: this.pageIndex(),
    size: this.pageSize(),
  }));

  // ======================= Data Loading =======================
  private leads$ = toObservable(this.query).pipe(
    tap(() => this.isLoading.set(true)),
    switchMap((q) =>
      this.leadsService.getFollowUpTableTeleSales(
        q.search,
        q.date,
        q.page,
        q.size
      )
    ),
    finalize(() => this.isLoading.set(false))
  );

  private response = toSignal(this.leads$, {
    initialValue: {
      succeeded: true,
      data: {
        items: [] as IFollowUp[],
        totalCount: 0,
      },
    },
  });

  // ======================= Public Data =======================
  leadsList = computed(() => this.response().data.items);
  totalCount = computed(() => this.response().data.totalCount);

  // ======================= Constructor =======================
  constructor(
    private leadsService: FollowUpTableTeleSalseService,
    private router: Router
  ) {}

  // ======================= UI Handlers =======================
  onSearch(value: string): void {
    this.searchTerm.set(value);
    this.pageIndex.set(1);
  }

  onDropdownChange(label: string): void {
    const option = this.dateFilterOptions.find((o) => o.label === label);
    this.dateFilter.set(option?.value ?? 2);
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
    this.dateFilter.set(2);
    this.pageIndex.set(1);
  }

  onView(row: IFollowUp): void {
    this.router.navigate([
      '/dashboard/telesales/follow-up-tele/view',
      row.contactId,
    ]);
  }

  // ======================= Helpers =======================
  get dateFilterLabels(): string[] {
    return this.dateFilterOptions.map((o) => o.label);
  }
}
