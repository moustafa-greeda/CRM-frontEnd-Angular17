import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { ILeads, ILeadsSearchParams } from '../../../core/Models/leads/ileads';
import { BreadcrumbItem } from '../../../shared/interfaces/breadcrumb-item.interface';
import { ActionButton } from '../../../shared/interfaces/action-button.interface';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';
import { LeadsDataService } from './services/leads-data.service';
import { LeadsCrudService } from './services/leads-crud.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ViewToggleComponent } from '../../../shared/ui/view-toggle/view-toggle.component';
import { PaginationControlsComponent } from '../../../shared/components/pagination-card/pagination-card-controls.component';
import { GridCardsComponent } from '../../../shared/components/card/grid-cards.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { PaginationComponent } from '../../../shared/components/pagination-card/pagination.component';
import { NoResultsMessageComponent } from '../../../shared/components/no-results-message/no-results-message.component';

// Filter options with icons
const FILTER_OPTIONS = [
  { value: 'recent', label: 'اختر طريقة البحث', icon: 'bi-person-fill-add' },
  { value: 'name', label: 'الاسم', icon: 'bi-person' },
  { value: 'companyName', label: 'اسم الشركة', icon: 'bi-building' },
  { value: 'email', label: 'البريد الإلكتروني', icon: 'bi-envelope' },
  { value: 'phone', label: 'رقم الهاتف', icon: 'bi-telephone' },
  { value: 'position', label: 'المنصب', icon: 'bi-briefcase' },
];

@Component({
  selector: 'app-show-leads',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatPaginatorModule,
    PageHeaderComponent,
    SearchInputComponent,
    ButtonComponent,
    ViewToggleComponent,
    PaginationControlsComponent,
    GridCardsComponent,
    CardComponent,
    TableComponent,
    PaginationComponent,
    NoResultsMessageComponent,
  ],
  templateUrl: './show-leads.component.html',
  styleUrl: './show-leads.component.css',
  // ⚡ تحسين الأداء - Change Detection على الـ Signals فقط
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowLeadsComponent implements OnInit {
  // UI State
  readonly pageTitle = 'إدارة العملاء';
  readonly breadcrumb: BreadcrumbItem[] = [
    { label: 'الرئيسية' },
    { label: 'بيانات العملاء', active: true },
  ];
  readonly filterOptionsWithIcons = FILTER_OPTIONS;

  // ========== البيانات ==========
  leadList = signal<ILeads[]>([]);
  filteredLeads = signal<ILeads[]>([]);
  selectedLeads = signal<Set<number>>(new Set());

  // ========== الفلاتر ==========
  lastSearchTerm = signal<string>('');
  selectedFilter = signal<string>('recent');
  isDropdownOpen = signal<boolean>(false);
  leadStatusLookupId = signal<string>('');
  isLeadStatusSelected = signal<boolean>(false);

  // ========== الـ Pagination ==========
  pageIndex = signal<number>(1);
  pageSize = signal<number>(10);
  totalCount = signal<number>(0);

  // ⚡ Loading state
  private _isLoadingLeads = signal<boolean>(false);
  isInitialLoad = signal<boolean>(true);
  isLoadingLeadStatus = signal<boolean>(false);
  isSearchPending = signal<boolean>(false);

  // View mode
  viewMode = signal<'card' | 'table'>('card');

  // Error state
  error = signal<string | null>(null);

  // Search debouncing
  private searchSubject = new Subject<string>();

  // ========== Computed Signals ==========
  readonly filterOptions = computed(() =>
    this.filterOptionsWithIcons.map((opt) => opt.label)
  );

  readonly totalPages = computed(() => {
    const pages = Math.ceil(this.totalCount() / this.pageSize());
    return pages > 0 ? pages : 0;
  });

  readonly currentPage = computed(() => this.pageIndex());

  readonly hasActiveSearchTerm = computed(() => {
    const term = this.lastSearchTerm();
    return !!term && term.trim().length > 0;
  });

  readonly hasNoLeads = computed(
    () => this.isInitialLoad() === false && this.filteredLeads().length === 0
  );

  readonly isLoadingLeads = computed(
    () => this.isInitialLoad() && this._isLoadingLeads()
  );

  readonly isAllSelected = computed(() => {
    const filtered = this.filteredLeads();
    const selected = this.selectedLeads();
    return (
      filtered.length > 0 && filtered.every((lead) => selected.has(lead.id))
    );
  });

  readonly selectedCount = computed(() => this.selectedLeads().size);

  readonly selectedLeadsArray = computed(() => {
    const selectedIds = this.selectedLeads();
    return this.leadList().filter((lead) => selectedIds.has(lead.id));
  });

  readonly searchPlaceholder = computed(() => {
    const placeholders: { [key: string]: string } = {
      recent: 'ابحث في جميع الحقول',
      name: 'ابحث بالاسم',
      companyName: 'ابحث باسم الشركة',
      email: 'ابحث بالبريد الإلكتروني',
      phone: 'ابحث برقم الهاتف',
      position: 'ابحث بالمنصب',
    };
    return placeholders[this.selectedFilter()] || 'ابحث عن العملاء';
  });

  readonly searchIcon = computed(() => {
    const icons: { [key: string]: string } = {
      recent: 'bi bi-search',
      name: 'bi bi-person',
      companyName: 'bi bi-building',
      email: 'bi bi-envelope',
      phone: 'bi bi-telephone',
      position: 'bi bi-briefcase',
    };
    return icons[this.selectedFilter()] || 'bi bi-search';
  });

  readonly inputType = computed(() => {
    const types: { [key: string]: string } = {
      recent: 'text',
      name: 'text',
      email: 'email',
      phone: 'tel',
      position: 'text',
    };
    return types[this.selectedFilter()] || 'text';
  });

  readonly inputPattern = computed(() => {
    const patterns: { [key: string]: string } = {
      recent: '.*',
      name: '.*',
      email: '.*',
      phone: '[0-9]*',
      position: '.*',
    };
    return patterns[this.selectedFilter()] || '.*';
  });

  readonly inputMode = computed(() => {
    const modes: { [key: string]: string } = {
      recent: 'text',
      name: 'text',
      email: 'email',
      phone: 'numeric',
      position: 'text',
    };
    return modes[this.selectedFilter()] || 'text';
  });

  readonly tableColumns = computed(() => [
    { key: 'name', header: 'الاسم' },
    { key: 'jobTitle', header: 'المسمى الوظيفي' },
    { key: 'email', header: 'البريد الإلكتروني' },
    { key: 'phone', header: 'رقم الهاتف' },
    { key: 'companyName', header: 'اسم الشركة' },
    { key: 'industeryName', header: 'الصناعة' },
    { key: 'contactSource', header: 'مصدر العميل' },
    {
      key: 'isHaveSoialMedia',
      header: 'لديه وسائل تواصل اجتماعي',
      formatter: 'booleanYesNo' as const,
    },
  ]);

  readonly leadStatusOptions = this.dataService.leadStatusOptions;

  actionButtons: ActionButton[] = [
    {
      label: 'إضافة عميل',
      iconClass: 'bi bi-plus',
      click: () => this.onAddClient(),
    },
    {
      label: 'استيراد من ال EXcel',
      iconClass: 'bi bi-file-earmark-excel',
      click: () => this.onImportFromExcel(),
    },
  ];

  constructor(
    private dataService: LeadsDataService,
    private crudService: LeadsCrudService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private notify: NotifyDialogService
  ) {}

  ngOnInit(): void {
    this.loadLeads();
    // Load lead status options after a short delay
    setTimeout(() => {
      this.loadLeadStatusOptions();
    }, 100);
  }

  // ==========================================================
  // 📥 تحميل البيانات
  // ==========================================================
  loadLeads(): void {
    this.lastSearchTerm.set('');
    this.pageIndex.set(1);
    this.selectedFilter.set('recent');
    this.searchLeads();
  }

  loadLeadStatusOptions(): void {
    this.isLoadingLeadStatus.set(true);
    this.dataService.loadLeadStatusOptions().subscribe({
      next: () => {
        this.isLoadingLeadStatus.set(false);
      },
      error: () => {
        this.isLoadingLeadStatus.set(false);
      },
    });
  }

  searchLeads(): void {
    // ✅ Prevent duplicate API calls if already loading
    if (this._isLoadingLeads()) {
      return;
    }

    this._isLoadingLeads.set(true);
    this.error.set(null);

    const searchParams: ILeadsSearchParams = {
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
    };

    // Add search parameter based on filter type
    const searchTerm = this.lastSearchTerm();
    if (searchTerm && searchTerm.trim()) {
      const trimmedTerm = searchTerm.trim();
      const filter = this.selectedFilter();

      // Clear all search fields first
      delete searchParams.name;
      delete searchParams.companyName;
      delete searchParams.email;
      delete searchParams.phone;
      delete searchParams.jobTitle;
      delete searchParams.searchKeyword;

      // Set only the relevant search field
      switch (filter) {
        case 'name':
          searchParams.name = trimmedTerm;
          break;
        case 'companyName':
          searchParams.companyName = trimmedTerm;
          break;
        case 'email':
          searchParams.email = trimmedTerm;
          break;
        case 'phone':
          searchParams.phone = trimmedTerm;
          break;
        case 'position':
          searchParams.jobTitle = trimmedTerm;
          break;
        case 'recent':
        default:
          searchParams.searchKeyword = trimmedTerm;
          break;
      }
    }

    this.dataService.searchLeads(searchParams).subscribe({
      next: (response) => {
        this.leadList.set(response.leads);
        this.filteredLeads.set(response.leads);
        this.totalCount.set(response.totalCount);
        this._isLoadingLeads.set(false);
        this.isSearchPending.set(false);

        if (this.isInitialLoad()) {
          this.isInitialLoad.set(false);
        }
      },
      error: () => {
        this.error.set('فشل في تحميل بيانات العملاء');
        this.leadList.set([]);
        this.filteredLeads.set([]);
        this.totalCount.set(0);
        this._isLoadingLeads.set(false);
        this.isSearchPending.set(false);

        if (this.isInitialLoad()) {
          this.isInitialLoad.set(false);
        }
      },
    });
  }


  onSearchChange(): void {
    this.isSearchPending.set(true);
    this.pageIndex.set(1);
    this.searchSubject.next(this.lastSearchTerm() || '');
  }

  onSearch(searchTerm: string): void {
    this.lastSearchTerm.set(searchTerm || '');
    this.pageIndex.set(1);
    this.isSearchPending.set(false);
    // Search immediately without debounce
    this.searchLeads();
  }

  clearSearch(): void {
    this.lastSearchTerm.set('');
    this.pageIndex.set(1);
    this.isSearchPending.set(false);
    this.searchLeads();
  }

  onFilterChange(): void {
    this.pageIndex.set(1);
    if (this.lastSearchTerm()?.trim()) {
      this.searchLeads();
    } else {
      this.loadLeads();
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen.set(!this.isDropdownOpen());
  }

  selectFilter(filterValue: string): void {
    this.selectedFilter.set(filterValue);
    this.isDropdownOpen.set(false);
    this.pageIndex.set(1);
    if (this.lastSearchTerm()?.trim()) {
      this.searchLeads();
    } else {
      this.loadLeads();
    }
  }

  selectFilterByLabel(label: string): void {
    const option = this.filterOptionsWithIcons.find(
      (opt) => opt.label === label
    );
    if (option) {
      this.selectFilter(option.value);
    }
  }

  // ==========================================================
  // 📄 الـ Pagination
  // ==========================================================
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.pageIndex()) {
      this.pageIndex.set(page);
      this.searchLeads();
    }
  }

  onTablePage(event: any): void {
    const newPage = (event?.pageIndex ?? 0) + 1;
    const pageChanged = newPage !== this.pageIndex();
    const pageSizeChanged =
      event?.pageSize && event.pageSize !== this.pageSize();

    if (pageChanged) {
      this.pageIndex.set(newPage);
    }
    if (pageSizeChanged) {
      this.pageSize.set(event.pageSize);
    }

    // Only call searchLeads if something actually changed
    if (pageChanged || pageSizeChanged) {
      this.searchLeads();
    }
  }

  onTablePageSize(newSize: number): void {
    if (newSize && newSize !== this.pageSize()) {
      this.pageSize.set(newSize);
      this.pageIndex.set(1);
      this.searchLeads();
    }
  }

  onPageSizeChange(newPageSize: number | Event): void {
    const pageSize =
      typeof newPageSize === 'number'
        ? newPageSize
        : +((newPageSize as Event).target as HTMLSelectElement).value;

    if (pageSize !== this.pageSize()) {
      this.pageSize.set(pageSize);
      this.pageIndex.set(1);
      this.searchLeads();
    }
  }

  handlePageChange(event: any): void {
    this.onPageChange(event as number);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage() - 2);
    const endPage = Math.min(this.totalPages(), this.currentPage() + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // ==========================================================
  // Selection Methods
  // ==========================================================
  onCardSelectionChange(client: ILeads, isSelected: boolean): void {
    const currentSelection = new Set(this.selectedLeads());
    if (isSelected) {
      currentSelection.add(client.id);
    } else {
      currentSelection.delete(client.id);
    }
    this.selectedLeads.set(currentSelection);
  }

  onClientSelect(client: ILeads, event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;
    const currentSelection = new Set(this.selectedLeads());

    if (isChecked) {
      currentSelection.add(client.id);
    } else {
      currentSelection.delete(client.id);
    }
    this.selectedLeads.set(currentSelection);
  }

  onSelectAllChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const filtered = this.filteredLeads();

    if (isChecked) {
      const newSelection = new Set(filtered.map((lead) => lead.id));
      this.selectedLeads.set(newSelection);
    } else {
      this.selectedLeads.set(new Set());
    }
  }

  isCardSelected(client: ILeads): boolean {
    return this.selectedLeads().has(client.id);
  }

  onTableRowSelection(evt: { row: ILeads; selected: boolean }): void {
    const fakeEvent = {
      target: { checked: evt.selected },
    } as unknown as Event;
    this.onClientSelect(evt.row, fakeEvent);
  }

  onTableSelectAll(isChecked: boolean): void {
    const fakeEvent = {
      target: { checked: isChecked },
    } as unknown as Event;
    this.onSelectAllChange(fakeEvent);
  }

  // ==========================================================
  // CRUD Operations
  // ==========================================================
  onAddClient(): void {
    this.router.navigate(['dashboard/admin/addLead']);
  }

  onImportFromExcel(): void {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.style.display = 'none';

    // Handle file selection
    input.onchange = (event: any) => {
      const file: File = event.target.files[0];
      if (!file) {
        return;
      }

      this.spinner.show();
      this.crudService.importFromExcel(
        file,
        () => {
          this.spinner.hide();
          this.loadLeads();
        },
        () => {
          this.spinner.hide();
        }
      );
    };

    // Trigger file selection dialog
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  createLeadForSelectedClients(): void {
    const selected = this.selectedLeadsArray();
    if (selected.length === 0) {
      return;
    }

    const leadStatusId = this.getLeadStatusId();
    this.spinner.show();
    this.crudService.createLeadsForMultipleClients(
      selected,
      leadStatusId,
      () => {
        this.spinner.hide();
        this.loadLeads();
        this.resetFormAfterSubmit();
      },
      () => {
        this.spinner.hide();
      }
    );
  }

  onLeadStatusChange(selectedStatus: string): void {
    this.leadStatusLookupId.set(selectedStatus);
    this.isLeadStatusSelected.set(
      Boolean(selectedStatus && selectedStatus.trim() !== '')
    );
  }

  // ==========================================================
  // View Mode
  // ==========================================================
  toggleViewMode(): void {
    this.viewMode.set(this.viewMode() === 'card' ? 'table' : 'card');
  }

  onViewModeChange(mode: 'card' | 'table'): void {
    this.viewMode.set(mode);
  }

  // ==========================================================
  // Utility Methods
  // ==========================================================
  trackByClientId(index: number, client: ILeads): number {
    return client.id;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.isDropdownOpen.set(false);
    }
  }

  private getLeadStatusId(): number {
    const statusName = this.leadStatusLookupId();
    if (!statusName) return 1; // Default

    const statusList = this.dataService.getCurrentLeadStatusList();
    const status = statusList.find((s) => s.name === statusName);
    return status?.id || 1;
  }

  private resetFormAfterSubmit(): void {
    // Reset selected leads
    this.selectedLeads.set(new Set());

    // Reset lead status selection
    this.leadStatusLookupId.set('');
    this.isLeadStatusSelected.set(false);

    // Reset search and filter
    this.lastSearchTerm.set('');
    this.selectedFilter.set('recent');

    // Reset pagination to first page
    this.pageIndex.set(1);
  }

  // Placeholder methods for unavailable features
  onEditClient(_: ILeads): void {
    this.notifyUnavailableFeature('تعديل العميل');
  }

  onDeleteClient(_: ILeads): void {
    this.notifyUnavailableFeature('حذف العميل');
  }

  onViewClient(_: ILeads): void {
    this.notifyUnavailableFeature('عرض العميل');
  }

  onMoreOptions(_: ILeads): void {
    this.notifyUnavailableFeature('المزيد من الخيارات');
  }

  onImport(): void {
    this.notifyUnavailableFeature('الاستيراد');
  }

  private notifyUnavailableFeature(action: string): void {
    this.notify.error({
      title: 'تنبيه',
      description: `${action} غير متاحة حالياً.`,
    });
  }
}
