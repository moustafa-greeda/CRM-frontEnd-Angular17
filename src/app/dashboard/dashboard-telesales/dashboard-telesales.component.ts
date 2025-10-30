import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  ITeleSalseActionResponse,
  ITeleSalseActionRequest,
} from '../../core/Models/teleSalse/itele-salse-action';
import { DashboardTeleService } from './dashboard.service';
import { AuthService } from '../../Auth/login/auth.service';
import { LeadStatusService } from '../../core/services/common/lead-status.service';
import { FormUiComponent } from '../../shared/components/form-ui/form-ui.component';
import { MatDialog } from '@angular/material/dialog';
import { NotifyDialogService } from '../../shared/notify-dialog-host/notify-dialog.service';
import { GetTeleSalesTableDataRequest } from '../../core/Models/teleSalse/get-tele-sales-table-data-request';
import { ICountry } from '../../core/Models/common/icountry';
import { ICity } from '../../core/Models/common/country-city.models';
import { CountryCityService } from '../../core/services/common/country-city.service';
import { StatusColorService } from '../../shared/services/status-color.service';
import { DateUtilsService } from '../../shared/services/date-utils.service';
import { AssignLeadsToSalesRequest } from '../../core/Models/teleSalse/tele-sales-dashboard.types';
import { GetAllSalesService } from '../../core/services/common/get-all-sales.service';
import { CurruncyService } from '../../core/services/common/curruncy.service';

@Component({
  selector: 'app-dashboard-telesales',
  templateUrl: './dashboard-telesales.component.html',
  styleUrls: ['./dashboard-telesales.component.css'],
})
export class DashboardTelesalesComponent implements OnInit {
  stats: any[] = [];
  searchPlaceholder = 'ابحث عن العملاء';
  listLeadStatus: any[] = [];
  leadStatusMap: Map<string, number> = new Map();
  leadsList: any[] = [];
  allLeadsCache: any[] = []; // Cache for client-side filtering
  salesList: any[] = [];
  currencyList: any[] = [];

  columns: any[] = [
    { key: 'contactName', header: 'الاسم' },
    { key: 'assigndate', header: 'تاريخ التعيين', formatter: 'date' },
    { key: 'leadStatus', header: 'حالة العميل المحتمل' },
    { key: 'country', header: 'الدولة' },
    { key: 'city', header: 'المدينة' },
    { key: 'lastActionTime', header: 'آخر تفاعل', formatter: 'datetime' },
    { key: 'actionNote', header: 'ملاحظة الإجراء' },
    { key: 'actions', header: 'الإجراءات' },
  ];
  // Filters
  countryList: ICountry[] = [];
  cityList: ICity[] = [];
  actionDateFilterOptions: string[] = ['اليوم', 'آخر 7 أيام', 'آخر 30 يوم'];
  selectedActionDateFilter: string = '--';

  // Derived option lists for dropdowns (template-safe)
  get countryNames(): string[] {
    return (this.countryList || []).map((c: any) => c?.name).filter(Boolean);
  }

  get cityNames(): string[] {
    return (this.cityList || []).map((c: any) => c?.name).filter(Boolean);
  }

  pageSize = 10;
  currentPage = 1; // Start from 1-based
  totalCount = 0;
  loadingLeads = false;
  teleSalesActions: ITeleSalseActionResponse | null = null;
  loadingActions = false;

  // Search and filter properties
  searchTerm: string = '';
  selectedLeadStatusId: number = 0;
  isSearching: boolean = false;
  selectedCountry: string = '';
  selectedCity: string = '';

  // Selected lead actions for dialog
  selectedLeadActions: any[] = [];
  selectedLead: any = null;
  showLeadActionsDialog: boolean = false;

  // User info
  userInfo: any = { name: this._authService.getUsername() || 'المستخدم' };

  // Recent interactions
  recentInteractions: any[] = [];
  loadingRecentInteractions: boolean = false;

  // Notifications
  notifications: any[] = [];
  loadingNotifications: boolean = false;

  // Lead status editing
  editingLeadId: number | null = null;
  selectedLeadForEdit: any = null;
  leadStatusOptions: string[] = [];
  // Use the service for status colors instead of inline map
  get leadStatusColorMap(): Record<string, string> {
    return this.statusColorService.getAllStatusColors();
  }

  constructor(
    private _dashboardService: DashboardTeleService,
    private _authService: AuthService,
    private _leadStatusService: LeadStatusService,
    private dialog: MatDialog,
    private notify: NotifyDialogService,
    private _countryCityService: CountryCityService,
    private statusColorService: StatusColorService,
    private dateUtils: DateUtilsService,
    private _salesService: GetAllSalesService,
    private _currencyService: CurruncyService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Get username from auth service
    const username = this._authService.getUsername();

    forkJoin({
      totalCalls: this._dashboardService.getCallCountTele(),
      closedLeads: this._dashboardService.GetMyClosedLeads(),
      TotalSales: this._dashboardService.GetTotalSalesCountThisMonth(),
      AverageCallDuration:
        this._dashboardService.GetAverageCallDurationThisMonth(),
    }).subscribe((res) => {
      this.stats = [
        {
          title: 'Total Calls This Month',
          count: res.totalCalls.data.count,
          icon: 'bi-telephone',
        },
        {
          title: 'Total closed leads this month',
          count: res.closedLeads.data.closedLeadsThisMonth,
          icon: 'bi bi-exclamation-triangle',
        },
        {
          title: 'Total Clients',
          count: res.TotalSales.data.totalLeadsAssignedThisMonth,
          icon: 'bi-person-fill-add',
        },
        {
          title: 'Avarage call distribution this month',
          count: res.AverageCallDuration.data.averageCallDuration,
          icon: 'bi bi-bar-chart',
        },
      ];
      // call get list lead status
      this.getListLeadStatus();
    });

    // Load tele sales actions
    this.loadTeleSalesActions();

    // Load recent interactions
    this.loadRecentInteractions();

    // Load notifications
    this.loadNotifications();

    // Load countries
    this.loadCountries();

    // Load sales list
    this.getSalesList();

    // Load currency list
    this.getCurrencyList();

    // Load leads data
    if (username) {
      this.loadLeadsData(username);
    }
  }
  //========================================= search and filter =================================
  onCountrySelected(option: string): void {
    this.selectedCountry = option || '';
    this.currentPage = 1;

    // Find country ID and load cities for this country
    const selectedCountry = this.countryList.find((c) => c.name === option);
    if (selectedCountry && selectedCountry.id != null) {
      this.loadCitiesByCountry(selectedCountry.id);
    } else {
      this.cityList = [];
    }

    this.applyClientSideFilter();
  }

  onCitySelected(option: string): void {
    this.selectedCity = option || '';
    this.currentPage = 1;
    this.applyClientSideFilter();
  }

  onActionDateFilterSelected(option: string): void {
    this.selectedActionDateFilter = option || '--';
    this.currentPage = 1;
    this.applyClientSideFilter();
  }

  private loadCountries(): void {
    this._countryCityService.getAllCountries().subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.countryList = response.data;
        }
      },
      error: () => {
        this.countryList = [];
      },
    });
  }

  private loadCitiesByCountry(countryId: number): void {
    this._countryCityService.getCitiesByCountryId(countryId).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.cityList = response.data;
        }
      },
      error: () => {
        this.cityList = [];
      },
    });
  }
  onSearch(event: any): void {
    // Handle search functionality
    this.searchTerm = event.target?.value || event;
    this.currentPage = 1; // Reset to first page on search

    // Use client-side filter
    this.applyClientSideFilter();
  }

  getListLeadStatus(): void {
    this._leadStatusService.getAllLeadStatus().subscribe({
      next: (response) => {
        this.listLeadStatus = response.data.map((status) => status.name);
        this.leadStatusOptions = response.data.map((status) => status.name); // For editing dropdown
        // Create map for quick lookup of ID by name
        response.data.forEach((status) => {
          this.leadStatusMap.set(status.name, status.id!);
        });
      },
      error: () => {
        // Handle error silently or show user-friendly message
      },
    });
  }

  // ========================================= get sales list =================================
  getSalesList(): void {
    this._salesService.getAllSales().subscribe({
      next: (response) => {
        this.salesList = response.data;
      },
    });
  }
  // ========================================= get currency list =================================
  getCurrencyList(): void {
    this._currencyService.getCurruncy().subscribe({
      next: (response) => {
        this.currencyList = response.data;
      },
    });
  }
  // ========================================= option selected =================================
  onOptionSelected(option: string): void {
    // Handle option selection
    // Get the ID from the map
    this.selectedLeadStatusId = this.leadStatusMap.get(option) || 0;
    this.currentPage = 1; // Reset to first page on filter change

    // Use client-side filter
    this.applyClientSideFilter();
  }

  onPageChange(event: any): void {
    // Prevent pagination if no data
    if (this.totalCount === 0) {
      return;
    }

    this.currentPage = event.pageIndex + 1; // Convert from 0-based to 1-based

    // Check if page size changed
    if (event.pageSize && event.pageSize !== this.pageSize) {
      this.pageSize = event.pageSize;
    }

    // Fetch current page from API (server-side paging)
    const username = this._authService.getUsername() || '';
    this.loadLeadsData(
      username,
      this.searchTerm,
      this.selectedLeadStatusId,
      true
    );
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1; // Reset to first page (1-based)

    // Fetch first page with new page size
    const username = this._authService.getUsername() || '';
    this.loadLeadsData(
      username,
      this.searchTerm,
      this.selectedLeadStatusId,
      true
    );
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'reminder':
        return 'bi-info-circle';
      case 'warning':
        return 'bi-exclamation-triangle';
      case 'info':
        return 'bi-info-circle';
      default:
        return 'bi-info-circle';
    }
  }

  loadLeadsData(
    username: string,
    searchTerm?: string,
    leadStatusId?: number,
    force: boolean = false
  ): void {
    // Use cached data if available and not forced
    if (!force && this.allLeadsCache.length > 0) {
      this.applyClientSideFilter();
      return;
    }

    // Load data with pagination/filters
    this.loadingLeads = true;
    this.isSearching = true;

    const payload: GetTeleSalesTableDataRequest = {
      contactName: this.searchTerm || '',
      assigndate: '',
      leadStatus: this.selectedLeadStatusId
        ? String(this.selectedLeadStatusId)
        : '',
      city: '',
      lastActionTime: '',
      actionNote: '',
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
    };

    this._dashboardService.getLeadsBelongsToTeleSales(payload).subscribe({
      next: (response) => {
        if (response && response.data) {
          const items = Array.isArray(response.data.items)
            ? response.data.items
            : Array.isArray(response.data)
            ? response.data
            : [];

          this.totalCount = response.data.totalCount ?? items.length ?? 0;

          // Assign page items directly (server-side paging), with date formatting
          this.leadsList = (items || []).map((lead: any) => ({
            ...lead,
            assigndate: this.formatCellValue(lead.assigndate, 'date'),
            lastActionTime: this.formatCellValue(
              lead.lastActionTime,
              'datetime'
            ),
          }));
        } else {
          this.leadsList = [];
          this.totalCount = 0;
        }

        this.loadingLeads = false;
        this.isSearching = false;
      },
      error: () => {
        this.loadingLeads = false;
        this.isSearching = false;
        this.leadsList = [];
        this.totalCount = 0;
      },
    });
  }

  private applyClientSideFilter(): void {
    if (this.allLeadsCache.length === 0) return;

    let filtered = [...this.allLeadsCache];

    // Search filter
    if (this.searchTerm?.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (lead) =>
          lead.contactName?.toLowerCase().includes(term) ||
          lead.actionNote?.toLowerCase().includes(term) ||
          lead.country?.toLowerCase().includes(term) ||
          lead.city?.toLowerCase().includes(term) ||
          lead.leadStatus?.toLowerCase().includes(term)
      );
    }

    // Lead status filter
    if (this.selectedLeadStatusId > 0) {
      const selectedStatus = this.listLeadStatus[this.selectedLeadStatusId - 1];
      filtered = filtered.filter((lead) => lead.leadStatus === selectedStatus);
    }

    // Country filter
    if (this.selectedCountry) {
      filtered = filtered.filter(
        (lead) =>
          (lead.country || '').toLowerCase() ===
          this.selectedCountry.toLowerCase()
      );
    }

    // City filter
    if (this.selectedCity) {
      filtered = filtered.filter(
        (lead) =>
          (lead.city || '').toLowerCase() === this.selectedCity.toLowerCase()
      );
    }

    // Action date filter
    if (
      this.selectedActionDateFilter &&
      this.selectedActionDateFilter !== '--'
    ) {
      const now = new Date();
      let fromDate: Date | null = null;
      if (this.selectedActionDateFilter === 'اليوم') {
        fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (this.selectedActionDateFilter === 'أمس') {
        fromDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1
        );
      } else if (this.selectedActionDateFilter === 'آخر 7 أيام') {
        fromDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 7
        );
      }

      if (fromDate) {
        filtered = filtered.filter((lead) => {
          const dt = lead.lastActionTime ? new Date(lead.lastActionTime) : null;
          return dt ? dt >= fromDate : false;
        });
      }
    }

    this.totalCount = filtered.length;

    // Apply pagination
    const start = (this.currentPage - 1) * this.pageSize;
    const paginatedData = filtered.slice(start, start + this.pageSize);

    // Format date fields before assigning
    this.leadsList = paginatedData.map((lead) => ({
      ...lead,
      assigndate: this.formatCellValue(lead.assigndate, 'date'),
      lastActionTime: this.formatCellValue(lead.lastActionTime, 'datetime'),
    }));
  }
  // ============================= add note for phone call ===============================
  addNoteForPhoneCall() {
    const dialogRef = this.dialog.open(FormUiComponent, {
      width: '50vw',
      maxWidth: '500px',
      height: 'auto',
      maxHeight: '90vh',
      data: {
        title: 'إضافة ملاحظة للمكالمة',
        subtitle: 'إضافة ملاحظة للمكالمة',
        fields: [
          {
            name: 'note',
            label: 'الملاحظة',
          },
        ],
      },
      disableClose: true,
      panelClass: 'agreement-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Add the new agreement to the data
        const newAgreement = {
          name: result.clientName,
          stage: result.stage,
          status: result.status,
          value: `${result.contractValue?.toLocaleString()} ريال`,
          periorety: result.priority,
          date: result.dueDate,
        };
      }
    });
  }

  loadTeleSalesActions(
    employeeId: number = 11,
    startDate?: string,
    endDate?: string
  ): void {
    this.loadingActions = true;
    this._dashboardService
      .getTeleSalesActions(employeeId, startDate, endDate)
      .subscribe({
        next: (response) => {
          this.teleSalesActions = response;
          this.loadingActions = false;
        },
        error: () => {
          this.loadingActions = false;
        },
      });
  }

  private addActionToGroupedState(action: {
    leadId: number;
    actionTypeId: number;
    actionNotes: string;
  }): void {
    if (!this.teleSalesActions || !this.teleSalesActions.data) {
      return;
    }

    const nowIso = new Date().toISOString();
    const newItem: any = {
      id: 0,
      leadId: action.leadId,
      actionTypeId: action.actionTypeId,
      actionNotes: action.actionNotes,
      actionDate: nowIso,
    };

    const groups: any[] = this.teleSalesActions.data.actionsGrouped || [];
    let group = groups.find((g: any) => g.actionTypeId === action.actionTypeId);
    if (!group) {
      group = {
        actionTypeId: action.actionTypeId,
        actionTypeName: this.getActionTypeNameById(action.actionTypeId),
        actions: [],
      };
      groups.unshift(group);
    }

    group.actions = [newItem, ...(group.actions || [])];

    const clonedGroups = groups.map((g: any) => ({
      ...g,
      actions: [...(g.actions || [])],
    }));
    this.teleSalesActions = {
      ...(this.teleSalesActions as any),
      data: {
        ...(this.teleSalesActions as any).data,
        actionsGrouped: clonedGroups,
      },
    } as ITeleSalseActionResponse;

    // Update open dialog list for same lead
    const actionTypeName = this.getActionTypeNameById(action.actionTypeId);
    const dialogItem = { ...newItem, actionTypeName };
    const currentLeadId = this.selectedLead?.leadId ?? this.selectedLead?.id;
    if (
      currentLeadId &&
      currentLeadId === action.leadId &&
      Array.isArray(this.selectedLeadActions)
    ) {
      this.selectedLeadActions = [dialogItem, ...this.selectedLeadActions];
    }

    // Optimistic recent interactions
    if (Array.isArray(this.recentInteractions)) {
      const actionTypeKey = this.getActionTypeKeyById(action.actionTypeId);
      const contactName =
        this.selectedLead?.contactName ||
        this.selectedLead?.name ||
        this.tryGetContactNameByLeadId(action.leadId) ||
        '';
      const recentItem: any = {
        actionType: actionTypeKey,
        actionTime: nowIso,
        contactName,
        actionText: action.actionNotes,
      };
      this.recentInteractions = [recentItem, ...this.recentInteractions];
    }

    this.cdr.detectChanges();
  }

  private getActionTypeKeyById(actionTypeId: number): string {
    switch (actionTypeId) {
      case 1:
        return 'Call';
      case 2:
        return 'Email';
      case 3:
        return 'Meeting';
      case 4:
        return 'Notes';
      case 5:
        return 'FollowUp';
      default:
        return 'Action';
    }
  }

  private tryGetContactNameByLeadId(leadId: number): string | null {
    const lead = this.leadsList.find((l) => (l.leadId ?? l.id) === leadId);
    return lead?.contactName || lead?.name || null;
  }

  // Load recent interactions from API
  loadRecentInteractions(): void {
    this.loadingRecentInteractions = true;
    this._dashboardService.getRecentInteractions().subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.recentInteractions = response.data;
        }
        this.loadingRecentInteractions = false;
      },
      error: () => {
        this.loadingRecentInteractions = false;
      },
    });
  }

  // Load notifications from API
  loadNotifications(): void {
    this.loadingNotifications = true;
    this._dashboardService.getNotifications().subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.notifications = response.data.items.map((notification) => ({
            id: notification.id,
            type: notification.type,
            typeText: this.getNotificationTypeText(notification.type),
            message: notification.body,
            time: this.formatNotificationTime(notification.createdAt),
            isRead: notification.isRead,
            title: notification.title,
            createdAt: notification.createdAt,
          }));
        }
        this.loadingNotifications = false;
      },
      error: () => {
        this.loadingNotifications = false;
      },
    });
  }

  // Get notification type text in Arabic (inline mapping)
  getNotificationTypeText(type: string): string {
    switch (type) {
      case 'login':
        return 'تسجيل الدخول';
      case 'reminder':
        return 'تذكير';
      case 'warning':
        return 'تحذير';
      case 'info':
        return 'معلومة';
      case 'assignment':
        return 'تعيين';
      case 'status_change':
        return 'تغيير الحالة';
      default:
        return 'تنبيه';
    }
  }

  // Format notification time
  formatNotificationTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
      return 'الآن';
    } else if (minutes < 60) {
      return `منذ ${minutes} دقيقة`;
    } else if (hours < 24) {
      return `منذ ${hours} ساعة`;
    } else if (days < 7) {
      return `منذ ${days} يوم`;
    } else {
      return date.toLocaleDateString('ar-EG');
    }
  }

  // Get lead name by ID from leadsList
  getLeadNameByLeadId(leadId: number): string {
    const lead = this.leadsList.find((l) => l.id === leadId);
    if (lead) {
      return lead.contactName;
    } else {
      return `Lead #${leadId}`;
    }
  }

  // Show all notifications/actions for a selected user
  onView(lead: any): void {
    const id = lead?.leadId;
    if (!id) {
      return;
    }

    // Filter actions for this specific lead and map with action type info
    const leadActions =
      this.teleSalesActions?.data?.actionsGrouped?.flatMap((group: any) =>
        group.actions
          .filter((action: any) => (action.leadId ?? action.id) === id)
          .map((action: any) => ({
            ...action,
            actionTypeName: group.actionTypeName,
            actionTypeId: group.actionTypeId,
          }))
      ) || [];

    if (leadActions.length === 0) {
      this.notify.open({
        type: 'error',
        title: 'لا توجد إجراءات',
        description: 'لا توجد إجراءات مسجلة لهذا العميل',
      });
      return;
    }

    // Store the actions and lead for the dialog
    this.selectedLeadActions = leadActions;
    this.selectedLead = lead;

    // Open the dialog
    this.showLeadActionsDialog = true;
  }

  // Get action type ID from type name
  getActionTypeIdFromType(actionType: string): number {
    switch (actionType) {
      case 'Call':
        return 1;
      case 'Email':
        return 2;
      case 'Meeting':
        return 3;
      case 'Notes':
        return 4;
      case 'FollowUp':
        return 5;
      default:
        return 0;
    }
  }

  // Get action type icon by ID
  getActionTypeIconById(actionTypeId: number): string {
    switch (actionTypeId) {
      case 1:
        return 'bi-telephone'; // Call
      case 2:
        return 'bi-envelope'; // Email
      case 3:
        return 'bi-camera-video'; // Meeting
      case 4:
        return 'bi-file-earmark-text'; // Notes
      case 5:
        return 'bi-arrow-repeat'; // FollowUp
      default:
        return 'bi-circle';
    }
  }

  // Get action type name by ID or action object
  getActionTypeNameById(actionTypeId: number | any): string {
    // If action object is passed, extract actionTypeName
    if (typeof actionTypeId === 'object' && actionTypeId !== null) {
      if (actionTypeId.actionTypeName) {
        // Map English names to Arabic
        const nameMap: { [key: string]: string } = {
          Call: 'مكالمة',
          Email: 'بريد إلكتروني',
          Meeting: 'اجتماع',
          Notes: 'ملاحظة',
          FollowUp: 'متابعة',
        };
        return (
          nameMap[actionTypeId.actionTypeName] || actionTypeId.actionTypeName
        );
      }
      if (actionTypeId.actionTypeId) {
        actionTypeId = actionTypeId.actionTypeId;
      }
    }

    switch (actionTypeId) {
      case 1:
        return 'مكالمة';
      case 2:
        return 'بريد إلكتروني';
      case 3:
        return 'اجتماع';
      case 4:
        return 'ملاحظة';
      case 5:
        return 'متابعة';
      default:
        return 'إجراء';
    }
  }

  getActionTypeIcon(actionTypeName: string): string {
    switch (actionTypeName.toLowerCase()) {
      case 'call':
        return 'bi-telephone';
      case 'email':
        return 'bi-envelope';
      case 'meeting':
        return 'bi-camera-video';
      case 'sms':
        return 'bi-chat-dots';
      case 'notes':
        return 'bi-file-earmark-text';
      case 'followup':
        return 'bi-arrow-repeat';
      default:
        return 'bi-circle';
    }
  }

  formatActionDate(dateString: string): string {
    if (!dateString) return '';
    return this.dateUtils.relativeTimeArabic(dateString);
  }

  formatCreatedDate(dateString: string): string {
    if (!dateString) return '';
    return this.dateUtils.formatDateTime(dateString);
  }

  formatUpdatedDate(dateString: string): string {
    if (!dateString) return '';
    return this.dateUtils.formatDateTime(dateString);
  }

  // Open action dialog with different types
  openActionDialog(lead: any, actionTypeId: number): void {
    // Action type configuration
    const actionTypes = {
      1: {
        name: 'مكالمة',
        icon: 'bi-telephone',
        label: 'الملاحظة',
        placeholder: 'أدخل ملاحظات المكالمة...',
        type: 'phone',
      },
      2: {
        name: 'بريد إلكتروني',
        icon: 'bi-envelope',
        label: 'الملاحظة',
        placeholder: 'أدخل ملاحظات البريد...',
        type: 'email',
      },
      3: {
        name: 'اجتماع',
        icon: 'bi-camera-video',
        label: 'الملاحظة',
        placeholder: 'أدخل ملاحظات الاجتماع...',
        type: 'meeting',
      },
      4: {
        name: 'ملاحظة',
        icon: 'bi-file-earmark-text',
        label: 'الملاحظة',
        placeholder: 'أدخل ملاحظتك هنا...',
        type: 'note',
      },
      5: {
        name: 'متابعة',
        icon: 'bi-arrow-repeat',
        label: 'الملاحظة',
        placeholder: 'أدخل ملاحظات المتابعة...',
        type: 'followup',
      },
    };

    const actionConfig = actionTypes[actionTypeId as keyof typeof actionTypes];

    if (!actionConfig) {
      this.notify.open({
        type: 'error',
        title: 'خطأ',
        description: 'نوع الإجراء غير معروف',
      });
      return;
    }

    const actionDialogConfig = {
      title: `إضافة ${actionConfig.name}`,
      submitText: 'حفظ',
      cancelText: 'إلغاء',
      fields: [
        {
          name: 'actionNotes',
          label: actionConfig.label,
          type: 'textarea',
          placeholder: actionConfig.placeholder,
          required: true,
          colSpan: 3,
        },
      ],
    };

    const dialogRef = this.dialog.open(FormUiComponent, {
      width: '700px',
      panelClass: 'agreement-dialog',
      data: {
        config: actionDialogConfig,
        initialData: {
          actionNotes: '',
        },
      },
    });

    // Listen to formSubmit event
    dialogRef.componentInstance.formSubmit.subscribe((formData) => {
      if (formData) {
        const requestData: ITeleSalseActionRequest = {
          leadId: lead.leadId,
          actionTypeId: actionTypeId,
          actionNotes: formData.actionNotes,
        };
        this.createTeleSalesAction(requestData);

        // Close the dialog after successful submission
        dialogRef.close();
      }
    });

    // Also listen for dialog close
    dialogRef.afterClosed().subscribe(() => {
      // Unsubscribe to prevent memory leaks
      dialogRef.componentInstance.formSubmit.unsubscribe();
    });
  }

  // TrackBy for actions list to reduce re-rendering
  trackByAction = (_: number, action: any) =>
    action?.id ?? `${action?.actionTypeId}-${action?.actionDate}`;

  // Action button methods for table
  onCall(lead: any): void {
    this.openActionDialog(lead, 1); // Call = 1
  }

  onEmail(lead: any): void {
    this.openActionDialog(lead, 2); // Email = 2
  }

  onMeeting(lead: any): void {
    this.openActionDialog(lead, 3); // Meeting = 3
  }

  onNote(lead: any): void {
    this.openActionDialog(lead, 4); // Notes = 4
  }

  onFollowUp(lead: any): void {
    this.openActionDialog(lead, 5); // FollowUp = 5
  }

  private createTeleSalesAction(data: ITeleSalseActionRequest): void {
    // Show loading state
    this.isSearching = true;

    this._dashboardService.createTeleSalesAction(data).subscribe({
      next: (response: any) => {
        this.isSearching = false;
        if (response.succeeded) {
          this.notify.open({
            autoCloseMs: 3000,
            type: 'success',
            title: 'تم بنجاح',
            description: 'تم إضافة الملاحظة بنجاح',
          });

          // Refresh the leads data to show updated information
          const username = this._authService.getUsername();
          if (username) {
            this.loadLeadsData(
              username,
              this.searchTerm,
              this.selectedLeadStatusId
            );
          }
          // Optimistically update actions list and recent interactions
          this.addActionToGroupedState({
            leadId: data.leadId,
            actionTypeId: data.actionTypeId,
            actionNotes: data.actionNotes,
          });
        } else {
          this.notify.open({
            type: 'error',
            title: 'خطأ',
            description: response.message || 'حدث خطأ أثناء إضافة الملاحظة',
          });
        }
      },
      error: (error) => {
        this.isSearching = false;

        let errorMessage = 'حدث خطأ أثناء إضافة الملاحظة';

        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        this.notify.open({
          type: 'error',
          title: 'خطأ',
          description: errorMessage,
        });
      },
    });
  }

  // Close the lead actions dialog
  closeLeadActionsDialog(): void {
    this.showLeadActionsDialog = false;
    this.selectedLeadActions = [];
    this.selectedLead = null;
  }

  // Format cell value based on column formatter
  formatCellValue(value: any, formatter?: string): string {
    if (!value) return '';

    if (formatter === 'date' || formatter === 'datetime') {
      const date = new Date(value);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      if (formatter === 'datetime') {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      }
      return `${day}/${month}/${year}`;
    }

    return value;
  }

  // ============================ Assign lead to sales ================================

  onAddButtonClick(lead: any): void {
    // Handle add button click - can delegate to assign or edit
    this.openAssignLeadToSalesDialog(lead);
  }

  openAssignLeadToSalesDialog(lead: any): void {
    // Ensure data is loaded - reload if empty
    if (!this.salesList || this.salesList.length === 0) {
      this.getSalesList();
    }
    if (!this.currencyList || this.currencyList.length === 0) {
      this.getCurrencyList();
    }

    // Convert salesList to FormUiComponent expected format: { value, label }[]
    const salesOptions = (this.salesList || []).map((sales: any) => ({
      value: sales.id,
      label: sales.name,
    }));

    // Convert currencyList to FormUiComponent expected format: { value, label }[]
    const currencyOptions = (this.currencyList || []).map((currency: any) => ({
      value: currency.id,
      label: currency.currency,
    }));

    // Warn if no options available
    if (salesOptions.length === 0) {
      console.warn('No sales employees available');
      // Dialog will show empty dropdown - user can close and retry
    }
    if (currencyOptions.length === 0) {
      console.warn('No currencies available');
      // Dialog will show empty dropdown - user can close and retry
    }

    const dialogRef = this.dialog.open(FormUiComponent, {
      width: '700px',
      panelClass: 'agreement-dialog',
      data: {
        config: {
          title: 'تعيين العميل لموظف للمبيعات',
          submitText: 'حفظ',
          cancelText: 'إلغاء',
          fields: [
            {
              name: 'salesId',
              label: 'موظف المبيعات',
              type: 'select',
              options: salesOptions,
              required: true,
              placeholder: 'اختر موظف المبيعات',
              colSpan: 2,
            },
            {
              name: 'currencyId',
              label: 'العملة',
              type: 'select',
              options: currencyOptions,
              required: true,
              placeholder: 'اختر العملة',
              colSpan: 1,
            },
            {
              name: 'notes',
              label: 'الملاحظات',
              type: 'textarea',
              required: false,
              placeholder: 'أدخل الملاحظات...',
              colSpan: 3,
            },
          ],
        },
      },
    });

    // Listen to formSubmit event
    dialogRef.componentInstance.formSubmit.subscribe((formData) => {
      if (formData) {
        // API expects array with single object
        const payload: AssignLeadsToSalesRequest[] = [
          {
            leadId: lead.leadId || 0,
            salesId: Number(formData.salesId) || 0,
            notes: formData.notes || 'string',
            currencyId: Number(formData.currencyId) || 0,
            buddgetValue: 0,
          },
        ];

        this._dashboardService.AssignLeadsToSales(payload).subscribe({
          next: (response) => {
            console.log('AssignLeadsToSales Response:', response);

            // Check if response is successful (multiple ways API might indicate success)
            const isSuccess =
              response &&
              (response.succeeded === true ||
                (response as any).success === true ||
                (!response.succeeded &&
                  !(response as any).errors &&
                  !(response as any).error));

            if (isSuccess) {
              // Close the dialog first
              dialogRef.close();

              // Show success notification after dialog closes

              this.notify.open({
                type: 'success',
                title: 'نجح',
                description:
                  response?.message ||
                  (response as any)?.data?.message ||
                  'تم تعيين العميل للمبيعات بنجاح',
              });

              // Refresh leads data
              const username = this._authService.getUsername();
              if (username) {
                this.loadLeadsData(
                  username,
                  this.searchTerm,
                  this.selectedLeadStatusId,
                  true
                );
              }
            } else {
              // Show error but don't close dialog so user can fix and retry
              const errorMsg =
                response?.message ||
                (response as any)?.errors?.join?.(' ') ||
                (response as any)?.error ||
                'حدث خطأ أثناء تعيين العميل';

              this.notify.open({
                type: 'error',
                title: 'خطأ',
                description: errorMsg,
              });
            }
          },
          error: (error) => {
            console.error('AssignLeadsToSales Error:', error);

            const errorMsg =
              error?.error?.message ||
              error?.error?.validationErrors?.[0]?.errorMessage ||
              error?.error?.data ||
              error?.message ||
              'فشل تعيين العميل للمبيعات';

            this.notify.open({
              type: 'error',
              title: 'خطأ',
              description: errorMsg,
            });
            // Don't close dialog on error so user can fix and retry
          },
        });
      }
    });

    // Unsubscribe on close
    dialogRef.afterClosed().subscribe(() => {
      dialogRef.componentInstance.formSubmit.unsubscribe();
    });
  }
  //=========================== Edit lead status ================================
  onEdit(lead: any): void {
    const id = lead.leadId;
    this.editingLeadId = id;
    if (!lead.id && lead.leadId) {
      lead.id = lead.leadId;
    }
    this.selectedLeadForEdit = lead;
    // Store original values for cancel
    lead._originalLeadStatus = lead.leadStatus;
    // Initialize draft status for auto-save
    lead._draftLeadStatus = lead.leadStatus;
    // Try multiple possible property names for assigned lead ID
    lead._originalAssignLeadId =
      lead.assignedLeadId ||
      lead.assignedToId ||
      lead.employeeId ||
      lead.assignedEmployeeId ||
      0;
  }

  saveLeadStatus(lead: any): void {
    const newStatus = lead._draftLeadStatus?.trim();
    const leadId = lead.leadId ?? lead.id;

    if (!leadId || !newStatus || newStatus === lead.leadStatus) {
      this.cancelLeadStatus(lead);
      return;
    }

    // Get assignLeadId from lead data or use current user's ID as fallback
    const assignLeadId =
      lead.assignedLeadId ||
      lead.assignedToId ||
      lead.employeeId ||
      lead.assignedEmployeeId ||
      this._authService.getEmployeeId() ||
      1; // Final fallback

    // Build payload with required fields
    const payload: any = {
      leadId: leadId,
      assignLeadId: assignLeadId,
      leadStatus: newStatus,
    };

    // Debug: payload keys can be inspected if needed

    this._dashboardService.editLeadStatus(payload).subscribe({
      next: (response) => {
        // Check if response indicates success
        if (response && response.succeeded === true) {
          lead.leadStatus = newStatus; // Update optimistically
          lead.assignLeadId = assignLeadId; // Update assignLeadId
          this.editingLeadId = null;
          this.selectedLeadForEdit = null;
          delete lead._draftLeadStatus;
          delete lead._originalLeadStatus;

          // lead status updated
          // Update in cache
          const cachedLead = this.allLeadsCache.find(
            (l) => (l.leadId ?? l.id) === leadId
          );
          if (cachedLead) {
            cachedLead.leadStatus = newStatus;
            cachedLead.assignLeadId = assignLeadId;
          }

          this.notify.open({
            type: 'success',
            title: 'نجح',

            description: response.data || 'تم تحديث حالة العميل المحتمل بنجاح',
          });
        } else {
          // API returned unsuccessful response
          this.handleUpdateError(lead);
        }
      },
      error: (error) => {
        console.error('API Error:', error);
        const errorMsg =
          error?.error?.validationErrors?.[0]?.errorMessage ||
          error?.error?.data ||
          error?.message ||
          'فشل تحديث حالة العميل المحتمل';
        this.handleUpdateError(lead, errorMsg);
      },
    });
  }

  cancelLeadStatus(lead: any): void {
    lead.leadStatus = lead._originalLeadStatus || lead.leadStatus;
    lead.assignLeadId = lead._originalAssignLeadId || lead.assignLeadId;
    this.editingLeadId = null;
    this.selectedLeadForEdit = null;
    delete lead._draftLeadStatus;
    delete lead._originalLeadStatus;
    delete lead._originalAssignLeadId;
  }

  isEditing(lead: any): boolean {
    return this.editingLeadId === lead.id;
  }

  onStatusChange(lead: any, newStatus: string): void {
    lead._draftLeadStatus = newStatus;
  }

  onAssignLeadIdChange(lead: any, newAssignLeadId: number): void {
    lead._draftAssignLeadId = newAssignLeadId;
  }

  private handleUpdateError(lead: any, errorMsg?: string): void {
    // Restore original value on error
    lead.leadStatus = lead._originalLeadStatus;
    lead.assignLeadId = lead._originalAssignLeadId;
    this.cancelLeadStatus(lead);

    this.notify.open({
      type: 'error',
      title: 'خطأ',
      description: errorMsg || 'فشل تحديث حالة العميل المحتمل',
    });
  }
}

// [
//   {
//     leadId: 0,
//     salesId: 0,
//     notes: 'nothing',
//     currencyId: 0,
//     buddgetValue: 0,
//   },
//   {
//     leadId: 75,
//     salesId: 1,
//     notes: 'nothing',
//     currencyId: 1,
//     buddgetValue: 0,
//   },
// ];
