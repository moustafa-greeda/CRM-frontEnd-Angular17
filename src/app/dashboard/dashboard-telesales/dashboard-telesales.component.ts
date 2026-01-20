import { Component, OnInit, OnDestroy, ChangeDetectorRef, DestroyRef, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  ITeleSalseActionResponse,
  ITeleSalseActionRequest,
} from '../../core/Models/teleSalse/itele-salse-action';
import { DashboardTeleService } from './dashboard.service';
import { AuthService } from '../../Auth/auth.service';
import { LeadStatusService } from '../../core/services/common/lead-status.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NotifyDialogService } from '../../shared/components/notify-dialog-host/notify-dialog.service';
import { GetTeleSalesTableDataRequest } from '../../core/Models/teleSalse/get-tele-sales-table-data-request';
import { CountryCityService } from '../../core/services/common/country-city.service';
import { StatusColorService } from '../../core/services/common/status-color.service';
import { DateUtilsService } from '../../core/services/common/date-utils.service';
import { AssignLeadsToSalesRequest } from '../../core/Models/teleSalse/tele-sales-dashboard.types';
import { GetAllSalesService } from '../../core/services/common/get-all-sales.service';
import { CurruncyService } from '../../core/services/common/curruncy.service';
import { CallStatusService } from '../../core/services/common/call-status.service';
import { CallDialogService } from '../../pages/pages-tele/calls/call-dialog.service';
import { CountCardComponent } from '../../shared/components/count-card/count-card.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { RecentInteractionsComponent } from '../../shared/components/recent-interactions/recent-interactions.component';
import { NotificationCardComponent } from '../../shared/components/notification-card/notification-card.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TelesalesFilterComponent } from './telesales-filter/telesales-filter.component';
import { ActionTypeService } from './services/action-type.service';
import { NotificationUtilsService } from './services/notification.service';
import { TeleActionDialogService } from './services/tele-action-dialog.service';
import { AssignSalesDialogService } from './services/assign-sales-dialog.service';
import { LeadViewService } from './services/lead-view.service';
import { LeadStatusEditorService } from './services/lead-status-editor.service';
import { DashboardDataService } from './services/dashboard-data.service';

@Component({
  selector: 'app-dashboard-telesales',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatPaginatorModule,
    CountCardComponent,
    TableComponent,
    RecentInteractionsComponent,
    NotificationCardComponent,
    TelesalesFilterComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-telesales.component.html',
  styleUrls: [
    './dashboard-telesales.component.css',
    '../sharedStyleDashboard.css',
  ],
})
export class DashboardTelesalesComponent implements OnInit, OnDestroy {
  // ========================================
  // Dependency Injection
  // ========================================
  private readonly _dashboardService = inject(DashboardTeleService);
  private readonly _authService = inject(AuthService);
  
  // Track first table load to disable animation after initial render
  private readonly isFirstTableLoad = signal<boolean>(true);
  readonly tableContainerClass = computed(() => 
    this.isFirstTableLoad() ? '' : 'no-table-animation'
  );
  private readonly notify = inject(NotifyDialogService);
  private readonly statusColorService = inject(StatusColorService);
  private readonly dateUtils = inject(DateUtilsService);

  private readonly _callDialogService = inject(CallDialogService);
  private readonly actionTypeService = inject(ActionTypeService);
  private readonly notificationUtils = inject(NotificationUtilsService);
  private readonly teleActionDialog = inject(TeleActionDialogService);
  private readonly assignSalesDialog = inject(AssignSalesDialogService);
  private readonly leadViewService = inject(LeadViewService);
  private readonly leadStatusEditor = inject(LeadStatusEditorService);
  readonly dashboardData = inject(DashboardDataService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  // ✅ Loading state management
  readonly isloading = signal<boolean>(true);
  private readonly criticalDataLoaded = signal<boolean>(false);
  private readonly leadsDataLoaded = signal<boolean>(false);
  
  // ✅ Timeout reference for cleanup (prevent memory leak)
  private secondaryDataTimeout?: ReturnType<typeof setTimeout>;

  // ========================================
  // Static Data
  // ========================================
  readonly searchPlaceholder = 'ابحث عن العملاء';
  readonly actionLabels = {
    edit: 'تعديل الميزانية',
    add: 'تعيين موظف سيلز',
  };
  readonly columns: any[] = [
    { key: 'contactName', header: 'الاسم' },
    { key: 'assigndate', header: 'تاريخ التعيين', formatter: 'date' },
    { key: 'leadStatus', header: 'حالة العميل المحتمل' },
    { key: 'country', header: 'الدولة' },
    { key: 'city', header: 'المدينة' },
    { key: 'lastActionTime', header: 'آخر تفاعل', formatter: 'datetime' },
    { key: 'actionNote', header: 'ملاحظة الإجراء' },
    { key: 'actions', header: 'الإجراءات' },
  ];
  readonly actionDisplayMode: 'inline' | 'dropdown' = 'dropdown';
  readonly actionDateFilterOptions: { value: number; label: string }[] = [
    { value: 0, label: 'اليوم' },
    { value: 1, label: 'هذا الأسبوع' },
    { value: 2, label: 'هذا الشهر' },
  ];

  // ========================================
  // State Signals
  // ========================================
  readonly leadsList = signal<any[]>([]);
  readonly selectedActionDateFilter = signal<number | null>(null);
  readonly pageSize = signal<number>(10);
  readonly currentPage = signal<number>(1);
  readonly totalCount = signal<number>(0);
  readonly loadingLeads = signal<boolean>(false);
  readonly teleSalesActions = signal<ITeleSalseActionResponse | null>(null);
  readonly loadingActions = signal<boolean>(false);
  readonly searchTerm = signal<string>('');
  readonly selectedLeadStatusName = signal<string>('');
  readonly isSearching = signal<boolean>(false);
  readonly selectedCountry = signal<string>('');
  readonly selectedCity = signal<string>('');
  readonly userInfo = signal<any>({ name: this._authService.getUsername() || 'المستخدم' });
  readonly recentInteractions = signal<any[]>([]);
  readonly loadingRecentInteractions = signal<boolean>(false);
  readonly notifications = signal<any[]>([]);
  readonly loadingNotifications = signal<boolean>(false);

  // ========================================
  // Computed Signals
  // ========================================
  readonly countryNames = computed(() => 
    (this.dashboardData.countryList() || []).map((c: any) => c?.name).filter(Boolean)
  );

  readonly cityNames = computed(() => 
    (this.dashboardData.cityList() || []).map((c: any) => c?.name).filter(Boolean)
  );

  readonly actionDateFilterLabels = computed(() => 
    this.actionDateFilterOptions.map((opt) => opt.label)
  );

  readonly leadStatusColorMap = computed(() => 
    this.statusColorService.getAllStatusColors()
  );

  ngOnInit(): void {
    const username = this._authService.getUsername();
    
    // ✅ Show loader immediately
    this.isloading.set(true);
    
    // ✅ CRITICAL: Load essential data first (parallel)
    this.loadCriticalData(username);
    
    // ✅ LAZY: Load non-critical data after a short delay (won't affect loader)
    // Store timeout reference for cleanup in ngOnDestroy
    this.secondaryDataTimeout = setTimeout(() => this.loadSecondaryData(), 500);
  }

  ngOnDestroy(): void {
    // ✅ Clear timeout to prevent memory leak
    if (this.secondaryDataTimeout) {
      clearTimeout(this.secondaryDataTimeout);
      this.secondaryDataTimeout = undefined;
    }
  }

  /**
   * ✅ Load CRITICAL data in parallel (faster loading)
   */
  private loadCriticalData(username: string | null): void {
    if (!username) {
      this.isloading.set(false);
      return;
    }

    // Load most important data in parallel using forkJoin
    forkJoin({
      stats: this.dashboardData.loadDashboardStatsObservable().pipe(take(1)),
      leadStatuses: this.dashboardData.loadLeadStatusesObservable().pipe(take(1)),
      callStatuses: this.dashboardData.loadCallStatusesObservable().pipe(take(1)),
      countries: this.dashboardData.loadCountriesObservable().pipe(take(1)),
      salesList: this.dashboardData.loadSalesListObservable().pipe(take(1)),
      currencyList: this.dashboardData.loadCurrencyListObservable().pipe(take(1)),
    }).subscribe({
      next: () => {
        // Mark critical data as loaded
        this.criticalDataLoaded.set(true);
        this.checkAndHideLoader();
        
        // Load leads data after critical data is loaded
        this.loadLeadsData(username);
      },
      error: () => {
        // Even on error, mark as loaded to show UI
        this.criticalDataLoaded.set(true);
        this.checkAndHideLoader();
        
        if (username) {
          this.loadLeadsData(username);
        }
      },
    });
  }

  /**
   * ✅ Check if all critical data is loaded and hide loader
   */
  private checkAndHideLoader(): void {
    if (this.criticalDataLoaded() && this.leadsDataLoaded()) {
      this.isloading.set(false);
    }
  }

  /**
   * ✅ Load SECONDARY data (lazy - not blocking UI)
   */
  private loadSecondaryData(): void {
    // Load less important data in parallel (won't block initial render)
    forkJoin({
      actions: of(null).pipe(take(1)), // Load when needed
      interactions: this._dashboardService.getRecentInteractions().pipe(take(1)),
      notifications: this._dashboardService.getNotifications().pipe(take(1)),
    }).subscribe({
      next: ({ interactions, notifications }) => {
        if (interactions?.succeeded) {
          this.recentInteractions.set(interactions.data);
        }
        if (notifications?.succeeded) {
          this.notifications.set(notifications.data.items.map((notification: any) => ({
            id: notification.id,
            type: notification.type,
            typeText: this.getNotificationTypeText(notification.type),
            message: notification.body,
            time: this.formatNotificationTime(notification.createdAt),
            isRead: notification.isRead,
            title: notification.title,
            createdAt: notification.createdAt,
          })));
        }
        this.loadingRecentInteractions.set(false);
        this.loadingNotifications.set(false);
      },
      error: () => {
        this.recentInteractions.set([]);
        this.notifications.set([]);
        this.loadingRecentInteractions.set(false);
        this.loadingNotifications.set(false);
      },
    });

    // Load actions separately (may take longer)
    this.loadTeleSalesActions();
  }

  // ========================================
  // Data Loading Methods
  // ========================================
  // ========================================
  // Search and Filter Handlers
  // ========================================
  onCountrySelected(option: string): void {
    this.selectedCountry.set(option || '');
    this.selectedCity.set('');
    this.currentPage.set(1);

    // Find country ID and load cities for this country
    const selectedCountry = this.dashboardData.countryList().find((c) => c.name === option);
    if (selectedCountry && selectedCountry.id != null) {
      this.dashboardData.loadCitiesByCountry(selectedCountry.id, this.destroyRef);
    } else {
      this.dashboardData.cityList.set([]);
      const username = this._authService.getUsername() || '';
      this.loadLeadsData(username);
      return;
    }

    // Get data from backend with country filter
    const username = this._authService.getUsername() || '';
    this.loadLeadsData(username);
  }

  onCitySelected(option: string): void {
    if (!this.selectedCountry()) {
      return;
    }
    this.selectedCity.set(option || '');
    this.currentPage.set(1);

    // Get data from backend with city filter
    const username = this._authService.getUsername() || '';
    this.loadLeadsData(username);
  }

  onActionDateFilterSelected(option: any): void {
    // Ensure option is a string (handle both string and Event types)
    const selectedOptionValue = typeof option === 'string' ? option : '';

    // Find the value (number) from the label (string)
    const selectedOption = this.actionDateFilterOptions.find(
      (opt) => opt.label === selectedOptionValue
    );
    this.selectedActionDateFilter.set(selectedOption
      ? selectedOption.value
      : null);
    this.currentPage.set(1);

    // Get data from backend with date filter
    const username = this._authService.getUsername() || '';
    this.loadLeadsData(username);
  }

  onSearch(event: any): void {
    // Handle search functionality
    this.searchTerm.set(event.target?.value || event);
    this.currentPage.set(1); // Reset to first page on search

    // Get data from backend with search filter
    const username = this._authService.getUsername() || '';
    this.loadLeadsData(username);
  }


  onOptionSelected(option: string): void {
    // Get the ID from the map
    this.selectedLeadStatusName.set(option || '');
    this.currentPage.set(1); // Reset to first page on filter change

    // Get data from backend with lead status filter
    const username = this._authService.getUsername() || '';
    this.loadLeadsData(username);
  }

  onResetFilters(): void {
    // Reset all filters
    this.searchTerm.set('');
    this.selectedCountry.set('');
    this.selectedCity.set('');
    this.selectedActionDateFilter.set(null);
    this.selectedLeadStatusName.set('');
    this.currentPage.set(1);

    // Clear city list when country is reset
    this.dashboardData.cityList.set([]);

    // Reload data with reset filters
    const username = this._authService.getUsername() || '';
    this.loadLeadsData(username);
  }

  onPageChange(event: any): void {
    // Prevent pagination if no data
    if (this.totalCount() === 0) {
      return;
    }

    this.currentPage.set(event.pageIndex + 1); // Convert from 0-based to 1-based

    // Check if page size changed
    if (event.pageSize && event.pageSize !== this.pageSize()) {
      this.pageSize.set(event.pageSize);
    }

    // Fetch current page from API (server-side paging)
    const username = this._authService.getUsername() || '';
    this.loadLeadsData(username);
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize.set(newPageSize);
    this.currentPage.set(1); // Reset to first page (1-based)

    // Fetch first page with new page size
    const username = this._authService.getUsername() || '';
    this.loadLeadsData(username);
  }


  loadLeadsData(username: string): void {
    // Disable table animation after first load
    if (this.isFirstTableLoad()) {
      setTimeout(() => {
        this.isFirstTableLoad.set(false);
      }, 1000); // Wait for initial animation to complete
    }

    // Always load data from backend (no client-side filtering)
    this.loadingLeads.set(true);
    this.isSearching.set(true);

    // Get date filter for API
    const dateFilter = this.selectedActionDateFilter() ?? undefined;

    // Debug: log the actionDateFilter being sent
    if (dateFilter !== undefined) {
      console.log('Action Date Filter:', {
        value: dateFilter,
        meaning:
          dateFilter === 0
            ? 'Today'
            : dateFilter === 1
            ? 'This Week'
            : dateFilter === 2
            ? 'This Month'
            : 'Unknown',
      });
    }

    const payload: GetTeleSalesTableDataRequest = {
      contactName: this.searchTerm() || '',
      searchKeyword: this.searchTerm() || '',
      assigndate: '',
      leadStatus: this.selectedLeadStatusName() || '',
      country: this.selectedCountry() || '',
      city: this.selectedCity() || '',
      lastActionTime: '', // Keep for backward compatibility if needed
      actionNote: '',
      actionDateFilter: dateFilter, // Pass date filter number (0, 1, or 2) to API
      pageIndex: this.currentPage(),
      pageSize: this.pageSize(),
    };

    this._dashboardService.getLeadsBelongsToTeleSales(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        if (response && response.data) {
          const items = Array.isArray(response.data.items)
            ? response.data.items
            : Array.isArray(response.data)
            ? response.data
            : [];

          this.totalCount.set(response.data.totalCount ?? items.length ?? 0);

          // Assign page items directly (server-side paging), with date formatting
          this.leadsList.set((items || []).map((lead: any) => ({
            ...lead,
            assigndate: this.formatCellValue(lead.assigndate, 'date'),
            lastActionTime: this.formatCellValue(
              lead.lastActionTime,
              'datetime'
            ),
          })));
        } else {
          this.leadsList.set([]);
          this.totalCount.set(0);
        }

        this.loadingLeads.set(false);
        this.isSearching.set(false);
        
        // ✅ Mark leads data as loaded
        this.leadsDataLoaded.set(true);
        this.checkAndHideLoader();
      },
      error: () => {
        this.loadingLeads.set(false);
        this.isSearching.set(false);
        this.leadsList.set([]);
        this.totalCount.set(0);
        
        // ✅ Even on error, mark as loaded to show UI
        this.leadsDataLoaded.set(true);
        this.checkAndHideLoader();
      },
    });
  }

  loadTeleSalesActions(
    employeeId: number = this._authService.getEmployeeId() || 0,
    startDate?: string,
    endDate?: string
  ): void {
    this.loadingActions.set(true);
    this._dashboardService
      .getTeleSalesActions(employeeId, startDate, endDate)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.teleSalesActions.set(response);
          console.log(this.teleSalesActions());
          this.loadingActions.set(false);
        },
        error: () => {
          this.loadingActions.set(false);
        },
      });
  }

  private addActionToGroupedState(action: {
    leadId: number;
    actionTypeId: number;
    actionNotes: string;
  }): void {
    const currentActions = this.teleSalesActions();
    if (!currentActions || !currentActions.data) {
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

    const groups: any[] = currentActions.data.actionsGrouped || [];
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
    this.teleSalesActions.set({
      ...(currentActions as any),
      data: {
        ...(currentActions as any).data,
        actionsGrouped: clonedGroups,
      },
    } as ITeleSalseActionResponse);

    // Optimistic recent interactions
    const currentInteractions = this.recentInteractions();
    if (Array.isArray(currentInteractions)) {
      const actionTypeKey = this.getActionTypeKeyById(action.actionTypeId);
      const contactName = this.tryGetContactNameByLeadId(action.leadId) || '';
      const recentItem: any = {
        actionType: actionTypeKey,
        actionTime: nowIso,
        contactName,
        actionText: action.actionNotes,
      };
      this.recentInteractions.set([recentItem, ...currentInteractions]);
    }

    // Update the lead's lastActionTime in the table without reloading
    this.updateLeadLastActionTime(action.leadId, nowIso, action.actionNotes);

    this.cdr.detectChanges();
  }

  /**
   * Update lead's last action time in the table optimistically
   */
  private updateLeadLastActionTime(leadId: number, actionTime: string, actionNote: string): void {
    const currentLeads = this.leadsList();
    const updatedLeads = currentLeads.map((lead: any) => {
      if (lead.leadId === leadId || lead.id === leadId) {
        return {
          ...lead,
          lastActionTime: this.formatCellValue(actionTime, 'datetime'),
          actionNote: actionNote,
        };
      }
      return lead;
    });
    this.leadsList.set(updatedLeads);
  }

  private getActionTypeKeyById(actionTypeId: number): string {
    return this.actionTypeService.getActionKey(actionTypeId);
  }

  private tryGetContactNameByLeadId(leadId: number): string | null {
    const lead = this.leadsList().find((l) => (l.leadId ?? l.id) === leadId);
    return lead?.contactName || lead?.name || null;
  }

  // Load recent interactions from API
  loadRecentInteractions(): void {
    this.loadingRecentInteractions.set(true);
    this._dashboardService.getRecentInteractions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.recentInteractions.set(response.data);
        }
        this.loadingRecentInteractions.set(false);
      },
      error: () => {
        this.loadingRecentInteractions.set(false);
      },
    });
  }

  // Load notifications from API
  loadNotifications(): void {
    this.loadingNotifications.set(true);
    this._dashboardService.getNotifications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.notifications.set(response.data.items.map((notification) => ({
            id: notification.id,
            type: notification.type,
            typeText: this.getNotificationTypeText(notification.type),
            message: notification.body,
            time: this.formatNotificationTime(notification.createdAt),
            isRead: notification.isRead,
            title: notification.title,
            createdAt: notification.createdAt,
          })));
        }
        this.loadingNotifications.set(false);
      },
      error: () => {
        this.loadingNotifications.set(false);
      },
    });
  }

  // Notification utilities
  getNotificationTypeText(type: string): string {
    return this.notificationUtils.getNotificationTypeText(type);
  }

  formatNotificationTime(dateString: string): string {
    return this.notificationUtils.formatNotificationTime(dateString);
  }

  getNotificationIcon(type: string): string {
    return this.notificationUtils.getNotificationIcon(type);
  }

  // ========================================
  // View Lead Actions Dialog
  // ========================================
  onView(lead: any): void {
    this.leadViewService.showLeadActionsDialog(lead, this.teleSalesActions());
  }

  // ========================================
  // Utility Methods (delegated to services)
  // ========================================
  getActionTypeNameById(actionTypeId: number | any): string {
    return this.actionTypeService.getActionName(actionTypeId);
  }

  getActionTypeIconById(actionTypeId: number): string {
    return this.actionTypeService.getActionIcon(actionTypeId);
  }

  getActionTypeIcon(actionTypeName: string): string {
    return this.actionTypeService.getActionIconByName(actionTypeName);
  }

  formatActionDate(dateString: string): string {
    return dateString ? this.dateUtils.relativeTimeArabic(dateString) : '';
  }

  formatCreatedDate(dateString: string): string {
    return dateString ? this.dateUtils.formatDateTime(dateString) : '';
  }

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

  // ========================================
  // Action button handlers
  // ========================================
  openActionDialog(lead: any, actionTypeId: number): void {
    this.teleActionDialog.openActionDialog(lead, actionTypeId, (data) => {
      this.createTeleSalesAction(data);
    });
  }
  onCall(lead: any): void {
    this._callDialogService.openCreateCallDialog({
      lead,
      onSuccess: () => {
        // No need to reload table, actions are updated optimistically
        this.notify.open({
          type: 'success',
          title: 'تم بنجاح',
          description: 'تم إضافة المكالمة بنجاح',
        });
      },
    });
  }

  onEmail(lead: any): void {
    this.openActionDialog(lead, 2);
  }

  onMeeting(lead: any): void {
    this.openActionDialog(lead, 3);
  }

  onNote(lead: any): void {
    this.openActionDialog(lead, 4);
  }

  onFollowUp(lead: any): void {
    this.openActionDialog(lead, 5);
  }

  // ========================================
  // Create TeleSales Action
  // ========================================
  private createTeleSalesAction(data: ITeleSalseActionRequest): void {
    this.isSearching.set(true);

    this._dashboardService.createTeleSalesAction(data)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (response: any) => {
        this.isSearching.set(false);
        if (response.succeeded) {
          this.notify.open({
            type: 'success',
            title: 'تم بنجاح',
            description: 'تم إضافة الملاحظة بنجاح',
          });

          // Optimistically update actions list and recent interactions without reloading table
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
        this.isSearching.set(false);

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


  // ========================================
  // Assign lead to sales
  // ========================================
  onAddButtonClick(lead: any): void {
    const salesList = this.dashboardData.salesList();
    const currencyList = this.dashboardData.currencyList();

    // Ensure data is loaded
    if (!salesList || salesList.length === 0 || !currencyList || currencyList.length === 0) {
      console.warn('Sales or currency data not loaded');
      return;
    }

    this.assignSalesDialog.openAssignDialog(
      lead,
      salesList,
      currencyList,
      (payload: AssignLeadsToSalesRequest[], closeDialog: () => void) => 
        this.handleAssignToSales(payload, closeDialog)
    );
  }

  private handleAssignToSales(
    payload: AssignLeadsToSalesRequest[],
    closeDialog: () => void
  ): void {
    this._dashboardService.AssignLeadsToSales(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const isSuccess =
            response?.succeeded === true ||
            (response?.message && response?.assignments) ||
            (response?.message?.includes('نجاح'));

          if (isSuccess) {
            // Close dialog on success
            closeDialog();

            this.notify.open({
              type: 'success',
              title: 'نجح',
              description: 'تم تعيين العميل للمبيعات بنجاح',
            });

            const username = this._authService.getUsername();
            if (username) {
              this.loadLeadsData(username);
            }
          } else {
            const errorMsg =
              response?.validationErrors?.[0]?.errorMessage ||
              response?.message ||
              'حدث خطأ أثناء تعيين العميل';

            this.notify.open({
              type: 'error',
              title: 'خطأ',
              description: errorMsg,
            });
          }
        },
        error: (error) => {
          const errorMsg =
            error?.error?.validationErrors?.[0]?.errorMessage ||
            error?.error?.message ||
            error?.message ||
            'فشل تعيين العميل للمبيعات';

          this.notify.open({
            type: 'error',
            title: 'خطأ',
            description: errorMsg,
          });
        },
      });
  }
  // ========================================
  // Edit lead status - delegated to service
  // ========================================
  onEdit(lead: any): void {
    this.leadStatusEditor.startEdit(lead);
  }

  saveLeadStatus(lead: any): void {
    const username = this._authService.getUsername();
    this.leadStatusEditor.saveLeadStatus(lead, () => {
      if (username) {
        this.loadLeadsData(username);
      }
    });
  }

  cancelLeadStatus(lead: any): void {
    this.leadStatusEditor.cancelEdit(lead);
  }

  isEditing(lead: any): boolean {
    return this.leadStatusEditor.isEditing(lead);
  }

  onStatusChange(lead: any, newStatus: string): void {
    this.leadStatusEditor.onStatusChange(lead, newStatus);
  }

  onAssignLeadIdChange(lead: any, newAssignLeadId: number): void {
    this.leadStatusEditor.onAssignLeadIdChange(lead, newAssignLeadId);
  }
}
