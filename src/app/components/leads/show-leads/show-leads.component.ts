import { Component, OnInit, HostListener } from '@angular/core';
import {
  ILeads,
  ILeadsResponse,
  ILeadsSearchParams,
} from '../../../core/Models/leads/ileads';
import { LeadsService } from '../leads.service';
import { TableExportService } from '../../filter-leads/shared/table-export.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { NotifyDialogService } from '../../../shared/notify-dialog-host/notify-dialog.service';
import { LeadStatusService } from '../../../core/services/common/lead-status.service';
import { ILeadStatus } from '../../../core/Models/common/ilead-status';

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

  filteredClients: ILeads[] = [];

  ngOnInit(): void {
    this.loadLeads();
    this.loadLeadStatusOptions();
    this.setupSearchDebouncing();
  }

  private setupSearchDebouncing(): void {
    this.searchSubject
      .pipe(
        debounceTime(3000), // Wait 3 seconds after user stops typing
        distinctUntilChanged() // Only emit if the value has changed
      )
      .subscribe((searchTerm: string) => {
        this.searchTerm = searchTerm;
        this.currentPage = 1; // Reset to first page when searching
        this.isSearchPending = false; // Hide pending indicator
        this.searchLeads();
      });
  }

  loadLeads(): void {
    // Load all data without search filters
    this.searchTerm = '';
    this.currentPage = 1;
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
      sortField: this.getSortField(),
      sortDirection: this.getSortDirection(),
      pageIndex: this.currentPage, // Send 1-based index, backend converts to 0-based offset
      pageSize: this.pageSize,
    };

    // Add specific field search based on selected filter
    if (this.searchTerm && this.searchTerm.trim()) {
      switch (this.selectedFilter) {
        case 'name':
          searchParams.name = this.searchTerm.trim();
          break;
        case 'email':
          searchParams.email = this.searchTerm.trim();
          break;
        case 'phone':
          searchParams.phone = this.searchTerm.trim();
          break;
        case 'position':
          searchParams.jobTitle = this.searchTerm.trim();
          break;
        case 'recent':
        default:
          searchParams.searchKeyword = this.searchTerm.trim();
          break;
      }
    }

    this.leadsService.SearchLeads(searchParams).subscribe({
      next: (response: ILeadsResponse) => {
        if (response.succeeded && response.data) {
          this.leads = response.data.items || [];
          this.totalCount = response.data.totalCount || 0;
          this.filteredClients = [...this.leads];
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
          this.isLoading = false;
        } else {
          this.error = 'فشل في تحميل بيانات العملاء';
          this.leads = [];
          this.filteredClients = [];
          this.totalPages = 0;
          this.isLoading = false;
        }
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
    // Show pending indicator
    this.isSearchPending = true;
    // Reset to page 1 when searching to search all data
    this.currentPage = 1;
    // Emit the search term to the debounced subject
    this.searchSubject.next(this.searchTerm);
  }

  // Clear search and reload all data
  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.isSearchPending = false;
    this.searchLeads();
  }

  onFilterChange(): void {
    this.currentPage = 1; // Reset to first page when filtering
    this.searchLeads();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectFilter(filterValue: string): void {
    this.selectedFilter = filterValue;
    this.isDropdownOpen = false;
    this.currentPage = 1; // Reset to first page when filtering
    // If there's a search term, search with new filter
    if (this.searchTerm && this.searchTerm.trim()) {
      this.searchLeads();
    } else {
      // If no search term, just reload all data
      this.searchLeads();
    }
  }

  getFilterLabel(filterValue: string): string {
    const labels: { [key: string]: string } = {
      recent: 'الإضافة مؤخرا',
      name: 'الاسم',
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

  onClientSelect(client: ILeads, event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;

    if (isChecked) {
      // Add to selected cards if not already selected
      if (!this.selectedCards.find((card) => card.id === client.id)) {
        this.selectedCards.push(client);
        // Call CreateLead API when card is selected
        this.createLeadForClient(client);
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
      // Select all visible cards
      this.selectedCards = [...this.filteredClients];
      // Call CreateLead API for all selected cards
      this.createLeadForMultipleClients(this.filteredClients);
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
    if (this.selectedCards.length > 0) {
      this.exportService.exportSelectedRows(this.selectedCards, {
        fileName: 'العملاء المحددين',
        showSpinner: true,
        spinnerMessage: 'جاري تصدير العملاء المحددين...',
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
    if (this.leads.length > 0) {
      this.exportService.exportAllData(this.leads, {
        fileName: 'جميع العملاء',
        showSpinner: true,
        spinnerMessage: 'جاري تصدير جميع العملاء...',
      });
    }
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
}
