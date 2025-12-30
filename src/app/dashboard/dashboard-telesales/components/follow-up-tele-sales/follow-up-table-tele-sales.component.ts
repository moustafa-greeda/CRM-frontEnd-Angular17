import { Component, effect, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FollowUpTableTeleSalseService } from './follow-up-table-tele-salse.service';
import { IFollowUp } from '../../interfaces/IFollowUp';

@Component({
  selector: 'app-follow-up-table-tele-sales',
  templateUrl: './follow-up-table-tele-sales.component.html',
  styleUrl: './follow-up-table-tele-sales.component.css',
})
export class FollowUpTeleSalesComponent implements OnInit {
  pageTitle = 'المتابعة';
  breadcrumb = [
    { label: 'الرئيسية', link: '/dashboard/telesales' },
    { label: 'المتابعة', link: '/dashboard/telesales/follow-up-tele' },
  ];
  leadsList = signal<IFollowUp[]>([]);
  totalCount = signal(0);
  pageSize = signal(10);
  pageIndex = signal(1);
  searchTerm = signal('');
  dateFilter = signal<number | null>(2);

  isLoading: boolean = false;
  hasActiveSearchTerm: boolean = false;
  hasNoLeads: boolean = false;

  dateFilterOptions: any[] = [
    { label: 'اليوم', value: 0 },
    { label: 'الاسبوع', value: 1 },
    { label: 'الشهر', value: 2 },
  ];
  constructor(
    private leadsService: FollowUpTableTeleSalseService,
    private router: Router
  ) {
    effect(() => {
      const search = this.searchTerm();
      const date = this.dateFilter() ?? 2;
      const page = this.pageIndex();
      const size = this.pageSize();

      this.isLoading = true;

      this.leadsService
        .getFollowUpTableTeleSales(search, date, page, size)
        .subscribe({
          next: (res: any) => {
            this.leadsList.set(res.data.items);
            this.totalCount.set(res.data.totalCount);
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          },
        });
    });
  }

  ngOnInit(): void {}
  //=================== get label for dropdown filter date ====================
  get dateFilterLabels(): string[] {
    return this.dateFilterOptions.map((opt) => opt.label);
  }

  // =============================== load all leads ===============================
  // loadLeads(): void {
  //   this.isLoading = true;
  //   this.leadsService
  //     .getFollowUpTableTeleSales(
  //       this.searchTerm(),
  //       this.dateFilter() ?? 2,
  //       this.pageIndex(),
  //       this.pageSize()
  //     )
  //     .subscribe({
  //       next: (res: any) => {
  //         this.leadsList.set(res.data.items);
  //         this.totalCount.set(res.data.totalCount);
  //         this.isLoading = false;
  //       },
  //       error: (error) => {
  //         console.error('حدث خطأ:', error);
  //         this.isLoading = false;
  //       },
  //     });
  // }

  // =============================== on dropdown change ===============================
  onDropdownChange(selectedLabel: string): void {
    // Find the option by label and get its value
    const selectedOption = this.dateFilterOptions.find(
      (opt) => opt.label === selectedLabel
    );
    this.dateFilter.set(selectedOption ? selectedOption.value : null);
    this.pageIndex.set(1);
  }
  // =============================== on search ===============================
  onSearch(event: any): void {
    this.searchTerm.set(event.target?.value || event);
    this.pageIndex.set(1);
  }

  // =============================== on page size change ===============================
  onPageSizeChange(event: any): void {
    // Handle both number and object (PageEvent) cases
    this.pageSize.set(event || event.pageSize);

    this.pageIndex.set(1);
  }

  // =============================== on page index  change ===============================
  onPageChange(event: any): void {
    this.pageIndex.set(
      event.pageIndex !== undefined
        ? event.pageIndex + 1
        : event.target?.value || event
    );
  }
  // =============================== reset filters ===============================
  resetFilters(): void {
    this.dateFilter.set(2);
    this.searchTerm.set('');
    this.pageIndex.set(1);
  }
  // =============================== columns table ================================
  columns: any[] = [
    { key: 'contactName', header: 'الاسم' },
    { key: 'actionType', header: 'نوع المتابعه' },
    { key: 'actionText', header: 'الملاحظة' },
    { key: 'dateFollowUp', header: 'الحالة' },
    { key: 'actions', header: 'الاجراءات' },
  ];
  // =============================== on view ================================
  onView(event: any): void {
    this.router.navigate([
      '/dashboard/telesales/follow-up-tele/view',
      event.contactId,
    ]);
  }
  // =============================== on edit ================================
}
