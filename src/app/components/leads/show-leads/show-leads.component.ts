import { Component, OnInit, HostListener } from '@angular/core';
import {
  ILeads,
  ILeadsResponse,
  ILeadsSearchParams,
} from '../../../core/Models/leads/ileads';
import { LeadsService } from '../leads.service';
import { TableExportService } from '../../../core/services/common/table-export.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';
import { LeadStatusService } from '../../../core/services/common/lead-status.service';
import { ILeadStatus } from '../../../core/Models/common/ilead-status';
import { BreadcrumbItem } from '../../../shared/interfaces/breadcrumb-item.interface';
import { ActionButton } from '../../../shared/interfaces/action-button.interface';

// Using ILeads interface from the API instead of local Client interface

@Component({
  selector: 'app-show-leads',
  templateUrl: './show-leads.component.html',
  styleUrl: './show-leads.component.css',
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
  leadStatusLookupId: string = ''; // Will be set after API call
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
    private exportService: TableExportService,
    private router: Router,
    private notify: NotifyDialogService,
    private leadStatusService: LeadStatusService
  ) {}
  // ====================== page header ======================
  pageTitle = 'إدارة الموظفين';
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
      iconClass: 'bi bi-box-arrow-in-up',
      click: () => console.log('Upload'),
      tooltip: 'Upload',
    },
    {
      iconClass: 'bi bi-box-arrow-right',
      click: () => console.log('Download'),
      tooltip: 'Download',
    },
  ];
  // =============================================================

  filteredClients: ILeads[] = [];

  ngOnInit(): void {
    this.loadLeads();
    this.loadLeadStatusOptions();
    this.setupSearchDebouncing();
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
    this.leadStatusService.getAllLeadStatus().subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.leadStatusList = response.data;
          this.leadStatusOptions = response.data.map((status) => status.name);
        }
        this.isLoadingLeadStatus = false;
      },
      error: (error) => {
        console.error('Error loading lead status options:', error);
        this.isLoadingLeadStatus = false;
        // Fallback to default options
        this.leadStatusOptions = ['تم التحويل', 'لم يتم التحويل'];
        this.leadStatusLookupId = 'تم التحويل';
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
      },
      error: (error: any) => {
        console.error('Error loading leads:', error);
        this.error = 'فشل في تحميل بيانات العملاء';
        this.leads = [];
        this.filteredClients = [];
        this.totalPages = 0;
        this.isLoading = false;
      },
    });
  }

  onSearchChange(): void {
    this.isSearchPending = true;
    this.currentPage = 1;
    this.searchSubject.next(this.searchTerm || '');
  }

  onSearch(searchTerm: string): void {
    this.searchTerm = searchTerm || '';
    this.currentPage = 1;
    this.isSearchPending = false;
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

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newPageSize = +target.value;
    this.pageSize = newPageSize;
    this.currentPage = 1; // Reset to first page when changing page size
    this.searchLeads();
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
    console.log('Import clicked');
  }

  onExport(): void {
    if (this.filteredClients.length > 0) {
      this.exportService.exportCurrentPage(this.filteredClients, {
        fileName: 'العملاء',
        showSpinner: true,
        spinnerMessage: 'جاري التصدير...',
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.importFromExcel(file);
    }
  }

  private importFromExcel(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Convert imported data to ILeads format
        const importedLeads: ILeads[] = jsonData.map(
          (item: any, index: number) => ({
            id: item['المعرف'] || item['id'] || Date.now() + index,
            name: item['الاسم'] || item['name'] || '',
            jobTitle: item['المسمى الوظيفي'] || item['jobTitle'] || null,
            email: item['البريد الإلكتروني'] || item['email'] || null,
            phone: item['رقم الهاتف'] || item['phone'] || '',
            companyName: item['اسم الشركة'] || item['companyName'] || null,
            industeryName:
              item['اسم الصناعة'] ||
              item['industryName'] ||
              item['industeryName'] ||
              '',
            locationName: item['الموقع'] || item['locationName'] || '',
            webSiteUrl:
              item['رابط الموقع'] ||
              item['webSiteUrl'] ||
              item['websiteUrl'] ||
              '',
            isHaveSoialMedia:
              item['لديه وسائل تواصل اجتماعي'] ||
              item['isHaveSoialMedia'] ||
              false,
            socialMediaLink:
              item['روابط وسائل التواصل الاجتماعي'] ||
              item['socialMediaLink'] ||
              '',
          })
        );

        // Add imported leads to existing data
        this.leads = [...this.leads, ...importedLeads];
        this.filteredClients = [...this.leads];

        // Show success message
        alert(`تم استيراد ${importedLeads.length} عميل بنجاح!`);
      } catch (error) {
        console.error('Error importing file:', error);
        alert('حدث خطأ أثناء استيراد الملف. تأكد من صحة تنسيق الملف.');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  onEditClient(client: ILeads): void {
    // TODO: Implement edit client functionality
    console.log('Edit client:', client);
  }

  onDeleteClient(client: ILeads): void {
    // TODO: Implement delete client functionality
    console.log('Delete client:', client);
  }

  onViewClient(client: ILeads): void {
    // TODO: Implement view client functionality
    console.log('View client:', client);
  }

  trackByClientId(index: number, client: ILeads): number {
    return client.id;
  }

  onMoreOptions(client: ILeads): void {
    // TODO: Implement more options menu (dropdown, context menu, etc.)
    console.log('More options for client:', client);
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

  // Export methods
  onExportSelected(): void {
    if (!this.selectedCards || this.selectedCards.length === 0) {
      this.notify.error({
        title: 'تنبيه',
        description: 'يرجى تحديد العملاء المراد تصديرها',
      });
      return;
    }

    try {
      this.exportService.exportSelectedRows(this.selectedCards, {
        fileName: 'العملاء المحددين',
        showSpinner: true,
        spinnerMessage: 'جاري تصدير العملاء المحددين...',
      });
    } catch (error) {
      console.error('Error exporting selected leads:', error);
      this.notify.error({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تصدير العملاء المحددين',
        autoCloseMs: 3000,
      });
    }
  }

  onExportCurrentPage(): void {
    if (this.filteredClients.length > 0) {
      this.exportService.exportCurrentPage(this.filteredClients, {
        fileName: 'صفحة العملاء الحالية',
        showSpinner: true,
        spinnerMessage: 'جاري تصدير صفحة العملاء الحالية...',
      });
    }
  }

  onExportAll(): void {
    // Load all data from API without pagination
    this.isLoading = true;
    const searchParams: ILeadsSearchParams = {
      pageIndex: 1,
      pageSize: this.totalCount,
      sortField: this.getSortField(),
      sortDirection: this.getSortDirection(),
    };

    // Add search parameters if exists
    if (this.searchTerm && this.searchTerm.trim()) {
      const trimmedTerm = this.searchTerm.trim();
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
          searchParams.searchKeyword = trimmedTerm;
          break;
      }
    }

    this.leadsService.SearchLeads(searchParams).subscribe({
      next: (response: ILeadsResponse) => {
        this.isLoading = false;
        if (response.succeeded && response.data && response.data.items) {
          const allLeads = response.data.items;
          if (allLeads.length > 0) {
            this.exportService.exportAllData(allLeads, {
              fileName: 'جميع العملاء',
              showSpinner: true,
              spinnerMessage: 'جاري تصدير جميع العملاء...',
            });
          } else {
            this.notify.error({
              title: 'تنبيه',
              description: 'لا توجد بيانات للتصدير',
              autoCloseMs: 3000,
            });
          }
        } else {
          this.isLoading = false;
          this.notify.error({
            title: 'خطأ',
            description: 'فشل في جلب البيانات للتصدير',
            autoCloseMs: 3000,
          });
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error loading all leads for export:', error);
        this.notify.error({
          title: 'خطأ',
          description: 'حدث خطأ أثناء جلب البيانات للتصدير',
          autoCloseMs: 3000,
        });
      },
    });
  }

  // ================================= CreateLead Methods ===========================

  /**
   * Create a lead for a single client
   * @param client - The client to create a lead for
   */
  createLeadForClient(client: ILeads): void {
    // Find the selected lead status ID from the API data
    const selectedStatus = this.leadStatusList.find(
      (status) => status.name === this.leadStatusLookupId
    );
    const leadStatusId = selectedStatus?.id || 1; // Default to 1 if not found

    this.leadsService.CreateLead(client.id, leadStatusId).subscribe({
      next: (response) => {
        console.log(
          `Lead created successfully for client: ${client.name}`,
          response
        );
      },
      error: (error) => {
        console.error(`Error creating lead for client: ${client.name}`, error);
      },
    });
  }

  /**
   * Create leads for multiple clients
   * @param clients - Array of clients to create leads for
   */
  createLeadForMultipleClients(clients: ILeads[]): void {
    clients.forEach((client) => {
      this.createLeadForClient(client);
    });

    // Show success notification using NotifyDialogService
    this.notify.success({
      title: 'تم بنجاح!',
      description: `تم تعديل ${clients.length} عميل محتمل بنجاح!`,
      autoCloseMs: 3000,
    });

    // Reset form after successful submission
    this.resetFormAfterSubmit();
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
   * Table columns configuration for leads
   */
  get tableColumns(): {
    key: string;
    header: string;
    width?: string;
    formatter?: 'date' | 'datetime' | 'booleanYesNo';
  }[] {
    return [
      { key: 'name', header: 'الاسم', width: '150px' },
      { key: 'jobTitle', header: 'المسمى الوظيفي', width: '120px' },
      { key: 'email', header: 'البريد الإلكتروني', width: '200px' },
      { key: 'phone', header: 'رقم الهاتف', width: '120px' },
      { key: 'companyName', header: 'اسم الشركة', width: '150px' },
      { key: 'industeryName', header: 'الصناعة', width: '120px' },
      // { key: 'locationName', header: 'الموقع', width: '120px' },
      // { key: 'webSiteUrl', header: 'رابط الموقع', width: '120px' },
      {
        key: 'isHaveSoialMedia',
        header: 'لديه وسائل تواصل اجتماعي',
        width: '100px',
        formatter: 'booleanYesNo' as const,
      },
    ];
  }
}
