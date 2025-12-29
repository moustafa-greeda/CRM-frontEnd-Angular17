import {
  Component,
  OnInit,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  ILeads,
  ILeadsResponse,
  ILeadsSearchParams,
} from '../../../core/Models/leads/ileads';
import { LeadsService } from '../leads.service';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  of,
} from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';
import { LeadStatusService } from '../../../core/services/common/lead-status.service';
import { ILeadStatus } from '../../../core/Models/common/ilead-status';
import { BreadcrumbItem } from '../../../shared/interfaces/breadcrumb-item.interface';
import { ActionButton } from '../../../shared/interfaces/action-button.interface';
import { NgxSpinnerService } from 'ngx-spinner';

// Using ILeads interface from the API instead of local Client interface

@Component({
  selector: 'app-show-leads',
  templateUrl: './show-leads.component.html',
  styleUrl: './show-leads.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowLeadsComponent implements OnInit {
  // Search and filter properties
  searchTerm: string = '';
  selectedFilter: string = 'recent';
  isDropdownOpen: boolean = false;
  searchPlaceholder: string = 'ابحث في جميع الحقول';

  // Filter options with icons (for template use)
  filterOptionsWithIcons = [
    { value: 'recent', label: 'اختر طريقة البحث', icon: 'bi-person-fill-add' },
    { value: 'name', label: 'الاسم', icon: 'bi-person' },
    { value: 'companyName', label: 'اسم الشركة', icon: 'bi-building' },
    { value: 'email', label: 'البريد الإلكتروني', icon: 'bi-envelope' },
    { value: 'phone', label: 'رقم الهاتف', icon: 'bi-telephone' },
    { value: 'position', label: 'المنصب', icon: 'bi-briefcase' },
  ];

  // Getter to convert filter options to string array for dropdown
  get filterOptions(): string[] {
    return this.filterOptionsWithIcons.map((opt) => opt.label);
  }
  leads: ILeads[] = [];
  totalCount: number = 0;
  isLoading: boolean = false;
  error: string | null = null;
  selectedCards: ILeads[] = [];
  isAllSelected: boolean = false;
  leadStatusLookupId: string = '';
  leadStatusOptions: string[] = [];
  leadStatusList: ILeadStatus[] = [];
  isLoadingLeadStatus: boolean = false;
  isLeadStatusSelected: boolean = false;

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;

  // View mode: 'card' or 'table'
  viewMode: 'card' | 'table' = 'card';

  // Search debouncing
  private searchSubject = new Subject<string>();
  isSearchPending: boolean = false;

  constructor(
    private leadsService: LeadsService,
    private router: Router,
    private notify: NotifyDialogService,
    private leadStatusService: LeadStatusService,
    private cdr: ChangeDetectorRef,
    private _leadsService: LeadsService,
    private spinner: NgxSpinnerService
  ) {}
  // ====================== page header ======================
  pageTitle = 'إدارة العملاء';
  breadcrumb: BreadcrumbItem[] = [
    { label: 'الرئيسية' },
    { label: 'بيانات العملاء', active: true },
  ];

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
  filteredClients: ILeads[] = [];

  ngOnInit(): void {
    // Setup search debouncing first (synchronous)
    this.setupSearchDebouncing();

    // Load leads first (critical data)
    this.loadLeads();

    // Load lead status options after a short delay (non-critical, can load in background)
    setTimeout(() => {
      this.loadLeadStatusOptions();
    }, 100);
  }

  // =============================== import from excel ===================  // ========================================= import from excel ====================

  // =============================== import from excel ===================
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

      // Validate file type
      const validExtensions = ['.xlsx', '.xls'];
      const fileExtension = file.name
        .substring(file.name.lastIndexOf('.'))
        .toLowerCase();
      if (!validExtensions.includes(fileExtension)) {
        this.notify.error({
          title: 'خطأ في نوع الملف',
          description: 'يرجى اختيار ملف Excel بصيغة .xlsx أو .xls',
        });
        return;
      }

      // Show loader
      this.spinner.show();

      // Call API
      this._leadsService.importFromExcel(file).subscribe({
        next: (response) => {
          this.spinner.hide();
          console.log('Import response:', response);

          // Check if response has succeeded property
          // Even with status 200, API may return succeeded: false
          if (response && response.statusCode === 200) {
            this.notify.success({
              title: 'نجاح',
              description: response.message || 'تم استيراد البيانات بنجاح',
            });
            // Refresh employees list
            this.loadLeads();
          } else {
            // Even with status 200, if succeeded is false, show error
            // API returns status 200 but with succeeded: false when there's a business logic error
            this.notify.error({
              title: 'فشل الاستيراد',
              description:
                response?.message || 'حدث خطأ أثناء استيراد البيانات',
            });
          }
        },
        error: (error) => {
          this.spinner.hide();
          console.error('Error importing from Excel:', error);

          // Handle different error formats
          let errorMessage = 'حدث خطأ أثناء استيراد البيانات من ملف Excel';

          if (error?.error?.message) {
            errorMessage = error.error.message;
          } else if (error?.error?.errors) {
            errorMessage = Array.isArray(error.error.errors)
              ? error.error.errors.join(', ')
              : String(error.error.errors);
          } else if (error?.message) {
            errorMessage = error.message;
          }

          this.notify.error({
            title: 'فشل الاستيراد',
            description: errorMessage,
          });
        },
      });
    };

    // Trigger file selection dialog
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }
  private setupSearchDebouncing(): void {
    this.searchSubject
      .pipe(
        debounceTime(300), // Short delay to avoid excessive API calls while typing
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.isSearchPending = false;
        this.searchLeads();
      });
  }

  loadLeads(): void {
    // Load all data from API without search filters
    this.searchTerm = '';
    this.currentPage = 1;
    this.selectedFilter = 'recent';
    // Always call API
    this.searchLeads();
  }

  loadLeadStatusOptions(): void {
    this.isLoadingLeadStatus = true;
    this.cdr.markForCheck();
    this.leadStatusService.getAllLeadStatus().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.leadStatusList = response.data;
          this.leadStatusOptions = response.data.map((status) => status.name);
        }
        this.isLoadingLeadStatus = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingLeadStatus = false;
        // Fallback to default options
        this.leadStatusOptions = ['تم التحويل', 'لم يتم التحويل'];
        this.leadStatusLookupId = 'تم التحويل';
        this.cdr.markForCheck();
      },
    });
  }

  searchLeads(): void {
    this.isLoading = true;
    this.error = null;

    const searchParams: ILeadsSearchParams = {
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
      sortField: this.getSortField(),
      sortDirection: this.getSortDirection(),
    };

    // Add search parameter based on filter type
    if (this.searchTerm && this.searchTerm.trim()) {
      const trimmedTerm = this.searchTerm.trim();

      // Clear all search fields first
      delete searchParams.name;
      delete searchParams.companyName;
      delete searchParams.email;
      delete searchParams.phone;
      delete searchParams.jobTitle;
      delete searchParams.searchKeyword;

      // Set only the relevant search field
      switch (this.selectedFilter) {
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
          // Use searchKeyword for general search when filter is 'recent'
          searchParams.searchKeyword = trimmedTerm;
          break;
      }
    } else {
      // If search term is empty, ensure no search parameters are sent
      delete searchParams.name;
      delete searchParams.companyName;
      delete searchParams.email;
      delete searchParams.phone;
      delete searchParams.jobTitle;
      delete searchParams.searchKeyword;
    }

    this.leadsService.SearchLeads(searchParams).subscribe({
      next: (response: ILeadsResponse) => {
        if (response.succeeded && response.data) {
          this.leads = response.data.items || [];
          this.totalCount = response.data.totalCount || 0;
          this.filteredClients = [...this.leads];
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        } else {
          this.error = 'فشل في تحميل بيانات العملاء';
          this.leads = [];
          this.filteredClients = [];
          this.totalPages = 0;
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'فشل في تحميل بيانات العملاء';
        this.leads = [];
        this.filteredClients = [];
        this.totalPages = 0;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  onSearchChange(): void {
    this.isSearchPending = true;
    this.currentPage = 1;
    this.cdr.markForCheck();
    this.searchSubject.next(this.searchTerm || '');
  }

  onSearch(searchTerm: string): void {
    this.searchTerm = searchTerm || '';
    this.currentPage = 1;
    this.isSearchPending = false;
    this.cdr.markForCheck();
    // Search immediately without debounce
    this.searchLeads();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.isSearchPending = false;
    this.searchLeads();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    if (this.searchTerm?.trim()) {
      this.searchLeads();
    } else {
      this.loadLeads();
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectFilter(filterValue: string): void {
    this.selectedFilter = filterValue;
    this.isDropdownOpen = false;
    this.currentPage = 1;
    if (this.searchTerm?.trim()) {
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

  getFilterLabel(filterValue: string): string {
    const labels: { [key: string]: string } = {
      recent: 'الإضافة مؤخرا',
      name: 'الاسم',
      companyName: 'اسم الشركة',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      position: 'المنصب',
    };
    return labels[filterValue] || '';
  }

  getSearchPlaceholder(): string {
    const placeholders: { [key: string]: string } = {
      recent: 'ابحث في جميع الحقول',
      name: 'ابحث بالاسم',
      companyName: 'ابحث باسم الشركة',
      email: 'ابحث بالبريد الإلكتروني',
      phone: 'ابحث برقم الهاتف',
      position: 'ابحث بالمنصب',
    };
    return placeholders[this.selectedFilter] || 'ابحث عن العملاء';
  }

  getSearchIcon(): string {
    const icons: { [key: string]: string } = {
      recent: 'bi bi-search',
      name: 'bi bi-person',
      companyName: 'bi bi-building',
      email: 'bi bi-envelope',
      phone: 'bi bi-telephone',
      position: 'bi bi-briefcase',
    };
    return icons[this.selectedFilter] || 'bi bi-search';
  }

  getInputType(): string {
    const types: { [key: string]: string } = {
      recent: 'text',
      name: 'text',
      email: 'email',
      phone: 'tel',
      position: 'text',
    };
    return types[this.selectedFilter] || 'text';
  }

  getInputPattern(): string {
    const patterns: { [key: string]: string } = {
      recent: '.*',
      name: '.*',
      email: '.*',
      phone: '[0-9]*',
      position: '.*',
    };
    return patterns[this.selectedFilter] || '.*';
  }

  getInputMode(): string {
    const modes: { [key: string]: string } = {
      recent: 'text',
      name: 'text',
      email: 'email',
      phone: 'numeric',
      position: 'text',
    };
    return modes[this.selectedFilter] || 'text';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-dropdown')) {
      this.isDropdownOpen = false;
    }
  }

  // Helper methods for backend search
  private getSortField(): string {
    switch (this.selectedFilter) {
      case 'name':
        return 'name';
      case 'companyName':
        return 'companyName';
      case 'email':
        return 'email';
      case 'phone':
        return 'phone';
      case 'position':
        return 'jobTitle';
      case 'recent':
      default:
        return 'id';
    }
  }

  private getSortDirection(): 'asc' | 'desc' {
    switch (this.selectedFilter) {
      case 'recent':
        return 'desc';
      default:
        return 'asc';
    }
  }

  // Pagination methods
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Always search with current search term and filter
      this.searchLeads();
    }
  }

  // Handlers for reusable table component
  onTablePage(event: any): void {
    // MatPaginator PageEvent: pageIndex is 0-based
    const newPage = (event?.pageIndex ?? 0) + 1;
    if (newPage !== this.currentPage) {
      this.currentPage = newPage;
    }
    if (event?.pageSize && event.pageSize !== this.pageSize) {
      this.pageSize = event.pageSize;
    }
    this.searchLeads();
  }

  onTablePageSize(newSize: number): void {
    if (newSize && newSize !== this.pageSize) {
      this.pageSize = newSize;
      this.currentPage = 1;
      this.searchLeads();
    }
  }

  onTableRowSelection(evt: { row: ILeads; selected: boolean }): void {
    // Normalize to existing selection logic
    const fakeEvent = { target: { checked: evt.selected } } as unknown as Event;
    this.onClientSelect(evt.row, fakeEvent);
  }

  onTableSelectAll(isChecked: boolean): void {
    const fakeEvent = { target: { checked: isChecked } } as unknown as Event;
    this.onSelectAllChange(fakeEvent);
  }

  onPageSizeChange(newPageSize: number | Event): void {
    // Handle both Event (from direct select) and number (from component)
    const pageSize =
      typeof newPageSize === 'number'
        ? newPageSize
        : +((newPageSize as Event).target as HTMLSelectElement).value;

    this.pageSize = pageSize;
    this.currentPage = 1; // Reset to first page when changing page size
    this.searchLeads();
  }

  handlePageChange(event: any): void {
    this.onPageChange(event as number);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onAddClient(): void {
    // TODO: Implement add client functionality
    this.router.navigate(['dashboard/admin/addLead']);
  }

  onImport(): void {
    this.notifyUnavailableFeature('الاستيراد');
  }

  onEditClient(_: ILeads): void {
    this.notifyUnavailableFeature('تعديل العميل');
  }

  onDeleteClient(_: ILeads): void {
    this.notifyUnavailableFeature('حذف العميل');
  }

  onViewClient(_: ILeads): void {
    this.notifyUnavailableFeature('عرض العميل');
  }

  trackByClientId(index: number, client: ILeads): number {
    return client.id;
  }

  onMoreOptions(_: ILeads): void {
    this.notifyUnavailableFeature('المزيد من الخيارات');
  }

  onCardSelectionChange(client: ILeads, isSelected: boolean): void {
    // Handle selection from card component (boolean)
    if (isSelected) {
      // Add to selected cards if not already selected
      if (!this.selectedCards.find((card) => card.id === client.id)) {
        this.selectedCards.push(client);
      }
    } else {
      // Remove from selected cards
      this.selectedCards = this.selectedCards.filter(
        (card) => card.id !== client.id
      );
    }

    this.updateSelectAllState();
  }

  onClientSelect(client: ILeads, event: Event): void {
    // Handle selection from table component (Event)
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;

    if (isChecked) {
      // Add to selected cards if not already selected
      if (!this.selectedCards.find((card) => card.id === client.id)) {
        this.selectedCards.push(client);
      }
    } else {
      // Remove from selected cards
      this.selectedCards = this.selectedCards.filter(
        (card) => card.id !== client.id
      );
    }

    this.updateSelectAllState();
  }

  onSelectAllChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;

    if (isChecked) {
      // Select all visible cards (selection only, no API call)
      this.selectedCards = [...this.filteredClients];
    } else {
      // Deselect all cards
      this.selectedCards = [];
    }

    this.isAllSelected = isChecked;
  }

  isCardSelected(client: ILeads): boolean {
    return this.selectedCards.some((card) => card.id === client.id);
  }

  private updateSelectAllState(): void {
    this.isAllSelected =
      this.filteredClients.length > 0 &&
      this.selectedCards.length === this.filteredClients.length;
  }

  // ================================= CreateLead Methods ===========================
  createLeadForClient(client: ILeads) {
    return this.leadsService.CreateLead(client.id).pipe(
      map((response: any) => ({ success: true, client, response })),
      catchError((error: any) => {
        // Extract error message from validationErrors or fallback to message
        const errorMessage =
          error?.error?.validationErrors?.[0]?.errorMessage ||
          'هذا العميل موجود بالفعل';

        // Show error notification for individual client
        this.notify.error({
          title: 'خطأ',
          description: `${client.name || 'العميل'}: ${errorMessage}`,
        });

        // Return error result instead of throwing
        return of({ success: false, client, error: errorMessage });
      })
    );
  }

  /**
   * Create leads for multiple clients
   */
  createLeadForMultipleClients(clients: ILeads[]): void {
    if (clients.length === 0) {
      return;
    }

    // Show loading spinner
    this.spinner.show();

    // Create array of observables for all clients
    const createLeadObservables = clients.map((client) =>
      this.createLeadForClient(client)
    );

    // Wait for all requests to complete
    forkJoin(createLeadObservables).subscribe({
      next: (results) => {
        this.spinner.hide();

        // Count successful and failed operations
        const successful = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;

        if (successful > 0) {
          // Show success notification only if at least one succeeded
          this.notify.success({
            title: 'تم بنجاح!',
            description: `تم إنشاء ${successful} عميل محتمل بنجاح${
              failed > 0 ? ` (فشل ${failed} عميل)` : ''
            }!`,
          });

          // Refresh the leads list
          this.loadLeads();
        }

        // Reset form after submission
        this.resetFormAfterSubmit();
      },
      error: (error) => {
        this.spinner.hide();
        console.error('Error creating leads:', error);
        this.notify.error({
          title: 'خطأ',
          description: 'حدث خطأ أثناء إنشاء العملاء المحتملين',
        });
      },
    });
  }

  /**
   * Create leads for currently selected clients
   */
  createLeadForSelectedClients(): void {
    if (this.selectedCards.length > 0) {
      this.createLeadForMultipleClients(this.selectedCards);
    }
  }

  onLeadStatusChange(selectedStatus: string): void {
    this.leadStatusLookupId = selectedStatus;
    this.isLeadStatusSelected = Boolean(
      selectedStatus && selectedStatus.trim() !== ''
    );
  }

  /**
   * Reset form state after successful submission
   */
  resetFormAfterSubmit(): void {
    // Reset selected cards
    this.selectedCards = [];
    this.isAllSelected = false;

    // Reset lead status selection
    this.leadStatusLookupId = '';
    this.isLeadStatusSelected = false;

    // Reset search and filter
    this.searchTerm = '';
    this.selectedFilter = 'recent';

    // Reset pagination to first page
    this.currentPage = 1;
  }

  /**
   * Toggle between card and table view
   */
  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'card' ? 'table' : 'card';
  }

  /**
   * Handle view mode change from view-toggle component
   */
  onViewModeChange(mode: 'card' | 'table'): void {
    this.viewMode = mode;
  }

  /**
   * Table columns configuration for leads
   */
  get tableColumns(): {
    key: string;
    header: string;
    width?: string;
    formatter?: 'date' | 'datetime' | 'booleanYesNo';
  }[] {
    return [
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
    ];
  }

  private notifyUnavailableFeature(action: string): void {
    this.notify.error({
      title: 'تنبيه',
      description: `${action} غير متاحة حالياً.`,
    });
  }
}
