import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { take } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { ITeleSalseActionResponse } from '../../core/Models/teleSalse/itele-salse-action';
import { AuthService } from '../../Auth/auth.service';
import { LeadStatusService } from '../../core/services/common/lead-status.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NotifyDialogService } from '../../shared/components/notify-dialog-host/notify-dialog.service';
import {
  DetailViewDialogComponent,
  DetailViewDialogData,
} from '../../shared/components/detail-view-dialog/detail-view-dialog.component';
import { ICountry } from '../../core/Models/common/icountry';
import { ICity } from '../../core/Models/common/country-city.models';
import { CountryCityService } from '../../core/services/common/country-city.service';
import { StatusColorService } from '../../core/services/common/status-color.service';
import { DateUtilsService } from '../../core/services/common/date-utils.service';
import { DashboardSalseService } from './dashboard-salse.service';
import { PakegsService } from '../../core/services/common/pakegs.service';
import { CountCardComponent } from '../../shared/components/count-card/count-card.component';
import { SearchInputComponent } from '../../shared/ui/search-input/search-input.component';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { RecentInteractionsComponent } from '../../shared/components/recent-interactions/recent-interactions.component';
import { NotificationCardComponent } from '../../shared/components/notification-card/notification-card.component';

// Import new services
import { PacketService } from './services/packet.service';
import { SalesActionTypeService } from './services/action-type.service';
import { SalesNotificationService } from './services/notification.service';
import { SalesDataService } from './services/sales-data.service';
import { LeadsDataService, LeadsFilterState } from './services/leads-data.service';
import { LeadStatusEditorService } from './services/lead-status-editor.service';
import { BudgetManagementService } from './services/budget-management.service';
import { SalesActionDialogService } from './services/sales-action-dialog.service';
import { AccountantAssignmentService } from './services/accountant-assignment.service';
import { PacketOption } from './models/sales.types';

@Component({
  selector: 'app-dashboard-sales',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatDialogModule,
    CountCardComponent,
    SearchInputComponent,
    DropdownComponent,
    ButtonComponent,
    TableComponent,
    RecentInteractionsComponent,
    NotificationCardComponent,
  ],
  templateUrl: './dashboard-sales.component.html',
  styleUrls: ['./dashboard-sales.component.css', '../sharedStyleDashboard.css'],
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ Performance boost
})
export class DashboardSalesComponent implements OnInit, OnDestroy {
  // ✅ Convert all properties to signals
  readonly stats = signal<any[]>([]);
  readonly searchPlaceholder = signal<string>('ابحث عن العملاء');
  readonly listLeadStatus = signal<any[]>([]);
  readonly leadStatusMap = signal<Map<string, number>>(new Map());
  readonly leadsList = signal<any[]>([]);
  readonly allLeadsCache = signal<any[]>([]);
  readonly allPackets = signal<PacketOption[]>([]);

  readonly actionLabels = signal({
    edit: 'تعديل الميزانية',
  });

  readonly columns = signal<any[]>([
    { key: 'contactName', header: 'الاسم' },
    { key: 'assignDate', header: 'تاريخ التعيين', formatter: 'date' },
    { key: 'leadStatus', header: 'حالة العميل المحتمل' },
    { key: 'country', header: 'الدولة' },
    { key: 'city', header: 'المدينة' },
    { key: 'budget', header: 'الميزانية' },
    { key: 'currencyName', header: 'العملة' },
    { key: 'lastActionTime', header: 'آخر تفاعل', formatter: 'datetime' },
    { key: 'actionNote', header: 'ملاحظة الإجراء' },
    { key: 'packet', header: 'الباقة' },
    { key: 'actions', header: 'الإجراءات' },
  ]);
  
  // Filters
  readonly countryList = signal<ICountry[]>([]);
  readonly cityList = signal<ICity[]>([]);
  readonly actionDateFilterOptions = signal<string[]>(['اليوم', 'آخر 7 أيام', 'آخر 30 يوم']);
  readonly selectedActionDateFilter = signal<string>('--');
  readonly actionDisplayMode = signal<'inline' | 'dropdown'>('dropdown');

  // Pagination & loading
  readonly pageSize = signal<number>(10);
  readonly currentPage = signal<number>(1);
  readonly totalCount = signal<number>(0);
  readonly loadingLeads = signal<boolean>(false);
  readonly teleSalesActions = signal<ITeleSalseActionResponse | null>(null);
  readonly loadingActions = signal<boolean>(false);

  // Search and filter properties
  readonly searchTerm = signal<string>('');
  readonly selectedLeadStatusId = signal<number>(0);
  readonly selectedLeadStatusName = signal<string>('');
  readonly isSearching = signal<boolean>(false);
  readonly selectedCountry = signal<string>('');
  readonly selectedCity = signal<string>('');
  
  // Overall loading state - prevents content render until data is loaded
  readonly isloading = signal<boolean>(true);
  
  private criticalDataLoaded = signal<boolean>(false);
  private leadsDataLoaded = signal<boolean>(false);
  
  // ✅ Timeout reference for cleanup (prevent memory leak)
  private secondaryDataTimeout?: ReturnType<typeof setTimeout>;

  // Selected lead actions for dialog
  readonly selectedLeadActions = signal<any[]>([]);
  readonly selectedLead = signal<any>(null);
  readonly showLeadActionsDialog = signal<boolean>(false);

  // User info
  readonly userInfo = signal<any>({ name: '' });

  // Recent interactions
  readonly recentInteractions = signal<any[]>([]);
  readonly loadingRecentInteractions = signal<boolean>(false);

  // Notifications
  readonly notifications = signal<any[]>([]);
  readonly loadingNotifications = signal<boolean>(false);

  // Lead status editing
  readonly selectedLeadForEdit = signal<any>(null);
  readonly leadStatusOptions = signal<string[]>([]);

  // Persisted filters for refreshing actions after create
  private actionsStartDate = signal<string | undefined>(undefined);
  private actionsEndDate = signal<string | undefined>(undefined);

  // ✅ Computed signals (getters)
  readonly countryNames = computed(() => 
    (this.countryList() || []).map((c: any) => c?.name).filter(Boolean)
  );

  readonly cityNames = computed(() => 
    (this.cityList() || []).map((c: any) => c?.name).filter(Boolean)
  );

  readonly cityDropdownLabel = computed(() => 
    this.selectedCountry() ? 'اختر المدينة' : 'يجب اختيار الدولة أولاً'
  );

  readonly packetDropdownOptions = computed(() => 
    this.packetService.getPacketDropdownOptions(this.allPackets())
  );

  readonly defaultPacketOption = computed(() => 
    this.packetService.getDefaultPacketOption()
  );

  readonly leadStatusColorMap = computed(() => 
    this.statusColorService.getAllStatusColors()
  );

  // ✅ Inject services
  private readonly _dashboardService = inject(DashboardSalseService);
  private readonly _authService = inject(AuthService);
  private readonly _leadStatusService = inject(LeadStatusService);
  private readonly _pakegsService = inject(PakegsService);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotifyDialogService);
  private readonly _countryCityService = inject(CountryCityService);
  private readonly statusColorService = inject(StatusColorService);
  private readonly dateUtils = inject(DateUtilsService);
  private readonly packetService = inject(PacketService);
  private readonly actionTypeService = inject(SalesActionTypeService);
  private readonly notificationService = inject(SalesNotificationService);
  private readonly salesDataService = inject(SalesDataService);
  private readonly leadsDataService = inject(LeadsDataService);
  private readonly leadStatusEditor = inject(LeadStatusEditorService);
  private readonly budgetService = inject(BudgetManagementService);
  private readonly actionDialogService = inject(SalesActionDialogService);
  private readonly accountantService = inject(AccountantAssignmentService);

  normalizePacketOption(
    packet: {
      id: number | string | null;
      name: string;
      price?: number | null;
    } | null
  ): PacketOption | null {
    return this.packetService.normalizePacketOption(packet);
  }

  onResetFilters(): void {
    this.selectedCountry.set('');
    this.selectedCity.set('');
    this.selectedActionDateFilter.set('--');
    this.selectedLeadStatusId.set(0);
    this.selectedLeadStatusName.set('');
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadLeadsData(this._authService.getUsername() || '');
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

    // Force change detection with new references
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

    // If the actions dialog is open for the same lead, update it too
    const actionTypeName = this.getActionTypeNameById(action.actionTypeId);
    const dialogItem = { ...newItem, actionTypeName };
    const currentLead = this.selectedLead();
    const currentLeadId = currentLead?.leadId ?? currentLead?.id;
    const currentLeadActions = this.selectedLeadActions();
    if (
      currentLeadId &&
      currentLeadId === action.leadId &&
      Array.isArray(currentLeadActions)
    ) {
      this.selectedLeadActions.set([dialogItem, ...currentLeadActions]);
    }

    // Also reflect in recent interactions (optimistic) - match component schema
    const currentInteractions = this.recentInteractions();
    if (Array.isArray(currentInteractions)) {
      const actionTypeKey = this.getActionTypeKeyById(action.actionTypeId);
      const contactName =
        currentLead?.contactName ||
        this.tryGetContactNameByLeadId(action.leadId) ||
        '';
      const recentItem: any = {
        actionType: actionTypeKey,
        actionTime: nowIso,
        contactName,
        actionText: action.actionNotes,
      };
      this.recentInteractions.set([recentItem, ...currentInteractions]);
    }
  }

  private getActionTypeKeyById(actionTypeId: number): string {
    return this.actionTypeService.getActionTypeKeyById(actionTypeId);
  }

  private tryGetContactNameByLeadId(leadId: number): string | null {
    return this.leadsDataService.tryGetContactNameByLeadId(leadId);
  }

  ngOnInit(): void {
    const username = this._authService.getUsername();
    
    // Set user info
    this.userInfo.set({ name: username || 'المستخدم' });
    
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
    // Load packets immediately (needed for table)
    this.loadAllPackets();

    if (!username) {
      this.isloading.set(false);
      return;
    }

    // Load most important data in parallel using forkJoin
    forkJoin({
      stats: this.salesDataService.loadDashboardStats().pipe(
        take(1)
      ),
      leadStatuses: this.salesDataService.loadLeadStatuses().pipe(
        take(1)
      ),
      countries: this.salesDataService.loadCountries().pipe(
        take(1)
      ),
    }).subscribe({
      next: ({ stats, leadStatuses, countries }) => {
        this.stats.set(stats);
        this.listLeadStatus.set(leadStatuses.names);
        this.leadStatusOptions.set(leadStatuses.names);
        this.leadStatusMap.set(leadStatuses.map);
        this.countryList.set(countries);
        
        // Mark critical data as loaded
        this.criticalDataLoaded.set(true);
        this.checkAndHideLoader();
        
        // Load leads data after critical data is loaded
        this.loadLeadsData(username);
      },
      error: () => {
        this.stats.set([]);
        this.listLeadStatus.set([]);
        this.countryList.set([]);
        
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
      actions: of(null), // Load when needed
      interactions: this.salesDataService.loadRecentInteractions().pipe(take(1)),
      notifications: this.salesDataService.loadNotifications().pipe(take(1)),
    }).subscribe({
      next: ({ interactions, notifications }) => {
        this.recentInteractions.set(interactions);
        this.notifications.set(notifications);
      },
      error: () => {
        this.recentInteractions.set([]);
        this.notifications.set([]);
      },
    });
  }
  //========================================= load all packets ===========================================
  loadAllPackets(): void {
    // Subscribe to the packets observable
    this._pakegsService.packets$.pipe(take(1)).subscribe((packets) => {
      this.allPackets.set(packets);
      this.refreshPacketAssignments();
    });
  }
  //========================================= search and filter =================================
  onCountrySelected(option: string): void {
    this.selectedCountry.set(option || '');
    this.currentPage.set(1);

    // Find country ID and load cities for this country
    const selectedCountry = this.countryList().find((c) => c.name === option);
    if (selectedCountry && selectedCountry.id != null) {
      this.loadCitiesByCountry(selectedCountry.id);
    } else {
      this.cityList.set([]);
    }

    this.applyClientSideFilter();
  }

  onCitySelected(option: string): void {
    this.selectedCity.set(option || '');
    this.currentPage.set(1);
    this.applyClientSideFilter();
  }

  onPacketSelected(row: any, packet: PacketOption | null): void {
    if (!row) {
      return;
    }

    const assignmentId = row?.id ?? row?.leadId ?? row?.assignmentId;
    this.budgetService.updatePacketSelection(
      row,
      packet,
      this.allPackets(),
      (packetPrice) => {
        // Update in cache
        if (Number.isFinite(packetPrice)) {
          this.leadsDataService.updateLeadInCache(assignmentId, {
            budget: packetPrice,
            packetId: packet?.id,
            packet: packet,
          });
        }
        this.refreshLeadsAfterBudgetChange();
      },
      () => {
        // Error handler - already handled by service
      }
    );
  }

  onActionDateFilterSelected(option: string): void {
    this.selectedActionDateFilter.set(option || '--');
    this.currentPage.set(1);
    this.applyClientSideFilter();
  }

  private loadCountries(): void {
    // ✅ No longer needed - loaded in loadCriticalData
    // Kept for compatibility if called elsewhere
    if (this.countryList().length > 0) return; // Already loaded
    
    this.salesDataService.loadCountries().subscribe({
      next: (countries) => {
        this.countryList.set(countries);
      },
      error: () => {
        this.countryList.set([]);
      },
    });
  }

  private normalizePacketIdValue(rawId: any): number | null {
    return this.packetService.normalizePacketIdValue(rawId);
  }

  private resolvePacketOption(
    packetId: number | null,
    fallbackName?: string,
    fallbackPrice?: number | null
  ): PacketOption | null {
    return this.packetService.resolvePacketOption(
      packetId,
      this.allPackets(),
      fallbackName,
      fallbackPrice
    );
  }

  private resolvePacketByBudget(budget: number | null): PacketOption | null {
    return this.packetService.resolvePacketByBudget(budget, this.allPackets());
  }

  private attachPacketInfo(lead: any): any {
    return this.packetService.attachPacketInfo(lead, this.allPackets());
  }

  private refreshPacketAssignments(): void {
    const currentLeads = this.leadsList();
    const currentCache = this.allLeadsCache();
    
    if (currentLeads?.length) {
      this.leadsList.set(currentLeads.map((lead) =>
        this.attachPacketInfo(lead)
      ));
    }
    if (currentCache?.length) {
      this.allLeadsCache.set(currentCache.map((lead) =>
        this.attachPacketInfo(lead)
      ));
    }
  }

  private loadCitiesByCountry(countryId: number): void {
    this.salesDataService.loadCitiesByCountryId(countryId).subscribe({
      next: (cities) => {
        this.cityList.set(cities);
      },
      error: () => {
        this.cityList.set([]);
      },
    });
  }
  onSearch(event: any): void {
    // Handle search functionality
    this.searchTerm.set(event.target?.value || event);
    this.currentPage.set(1); // Reset to first page on search

    // Use client-side filter
    this.applyClientSideFilter();
  }

  getListLeadStatus(): void {
    // ✅ No longer needed - loaded in loadCriticalData
    // Kept for compatibility if called elsewhere
    if (this.listLeadStatus().length > 0) return; // Already loaded
    
    this.salesDataService.loadLeadStatuses().subscribe({
      next: (result) => {
        this.listLeadStatus.set(result.names);
        this.leadStatusOptions.set(result.names);
        this.leadStatusMap.set(result.map);
      },
      error: () => {
        // Handle error silently
      },
    });
  }

  // ========================================= option selected =================================
  onOptionSelected(option: string): void {
    // Handle option selection
    // Get the ID from the map
    this.selectedLeadStatusId.set(this.leadStatusMap().get(option) || 0);
    this.selectedLeadStatusName.set(option || '');
    this.currentPage.set(1); // Reset to first page on filter change

    // Use client-side filter
    this.applyClientSideFilter();
  }

  onPageChange(event: any): void {
    // Prevent pagination if no data
    if (this.totalCount() === 0) {
      return;
    }

    this.currentPage.set(event.pageIndex + 1);

    // Check if page size changed
    if (event.pageSize && event.pageSize !== this.pageSize()) {
      this.pageSize.set(event.pageSize);
    }

    // Fetch current page from API (server-side paging)
    const username = this._authService.getUsername() || '';
    this.loadLeadsData(
      username,
      this.searchTerm(),
      this.selectedLeadStatusId(),
      true
    );
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize.set(newPageSize);
    this.currentPage.set(1); // Reset to first page (1-based)

    // Fetch first page with new page size
    const username = this._authService.getUsername() || '';
    this.loadLeadsData(
      username,
      this.searchTerm(),
      this.selectedLeadStatusId(),
      true
    );
  }

  private refreshLeadsAfterBudgetChange(): void {
    const username = this._authService.getUsername();
    if (!username) {
      return;
    }

    this.loadLeadsData(
      username,
      this.searchTerm(),
      this.selectedLeadStatusId(),
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
    if (!force && this.leadsDataService.allLeadsCache.length > 0) {
      this.applyClientSideFilter();
      return;
    }

    // Load data with pagination/filters
    this.loadingLeads.set(true);
    this.isSearching.set(true);

    const filterState: LeadsFilterState = {
      searchTerm: this.searchTerm(),
      selectedLeadStatusId: this.selectedLeadStatusId(),
      selectedLeadStatusName: this.selectedLeadStatusName(),
      selectedCountry: this.selectedCountry(),
      selectedCity: this.selectedCity(),
      selectedActionDateFilter: this.selectedActionDateFilter(),
      currentPage: this.currentPage(),
      pageSize: this.pageSize(),
    };

    this.leadsDataService
      .loadLeadsData(
        username,
        filterState,
        this.leadStatusOptions(),
        this.allPackets(),
        force
      )
      .subscribe({
        next: (result) => {
          this.leadsList.set(result.leadsList);
          this.totalCount.set(result.totalCount);
          this.currentPage.set(result.currentPage);
          this.pageSize.set(result.pageSize);
          this.allLeadsCache.set(this.leadsDataService.allLeadsCache);
          this.loadingLeads.set(false);
          this.isSearching.set(false);
          
          // Mark leads data as loaded
          this.leadsDataLoaded.set(true);
          this.checkAndHideLoader();
        },
        error: () => {
          this.loadingLeads.set(false);
          this.isSearching.set(false);
          this.leadsList.set([]);
          this.totalCount.set(0);
          
          // Even on error, mark as loaded to show UI
          this.leadsDataLoaded.set(true);
          this.checkAndHideLoader();
        },
      });
  }

  private applyClientSideFilter(): void {
    const filterState: LeadsFilterState = {
      searchTerm: this.searchTerm(),
      selectedLeadStatusId: this.selectedLeadStatusId(),
      selectedLeadStatusName: this.selectedLeadStatusName(),
      selectedCountry: this.selectedCountry(),
      selectedCity: this.selectedCity(),
      selectedActionDateFilter: this.selectedActionDateFilter(),
      currentPage: this.currentPage(),
      pageSize: this.pageSize(),
    };

    const result = this.leadsDataService.applyClientSideFilter(
      filterState,
      this.listLeadStatus()
    );

    this.leadsList.set(result.leadsList.map((lead) => ({
      ...lead,
      assigndate: this.formatCellValue(lead.assigndate, 'date'),
      lastActionTime: this.formatCellValue(lead.lastActionTime, 'datetime'),
    })));
    this.totalCount.set(result.totalCount);
  }

  loadSalesActions(
    employeeId: number = 11,
    startDate?: string,
    endDate?: string
  ): void {
    this.loadingActions.set(true);
    // Store provided dates if passed; otherwise reuse last ones
    if (startDate !== undefined) this.actionsStartDate.set(startDate);
    if (endDate !== undefined) this.actionsEndDate.set(endDate);

    const effectiveStart = this.actionsStartDate();
    const effectiveEnd = this.actionsEndDate();

    this._dashboardService
      .getSalesActions(employeeId, effectiveStart, undefined, effectiveEnd)
      .subscribe({
        next: (response: any) => {
          this.teleSalesActions.set(response);
          this.loadingActions.set(false);
        },
        error: () => {
          this.loadingActions.set(false);
        },
      });
  }

  // Load recent interactions from API
  loadRecentInteractions(): void {
    // ✅ No longer needed - loaded in loadSecondaryData
    // Kept for compatibility
    if (this.recentInteractions().length > 0) return;
    
    this.loadingRecentInteractions.set(true);
    this.salesDataService.loadRecentInteractions().subscribe({
      next: (interactions) => {
        this.recentInteractions.set(interactions);
        this.loadingRecentInteractions.set(false);
      },
      error: () => {
        this.loadingRecentInteractions.set(false);
      },
    });
  }

  // Load notifications from API (using SalesDataService)
  loadNotifications(): void {
    // ✅ No longer needed - loaded in loadSecondaryData
    // Kept for compatibility
    if (this.notifications().length > 0) return;
    
    this.loadingNotifications.set(true);
    this.salesDataService.loadNotifications().subscribe({
      next: (items) => {
        this.notifications.set(items.map((notification) => ({
          id: notification.id,
          type: notification.type,
          typeText: this.notificationService.getNotificationTypeText(notification.type),
          message: notification.body,
          time: this.notificationService.formatNotificationTime(notification.createdAt),
          isRead: notification.isRead,
          title: notification.title,
          createdAt: notification.createdAt,
        })));
        this.loadingNotifications.set(false);
      },
      error: () => {
        this.loadingNotifications.set(false);
      },
    });
  }

  // Get notification type text in Arabic
  getNotificationTypeText(type: string): string {
    return this.notificationService.getNotificationTypeText(type);
  }

  // Format notification time
  formatNotificationTime(dateString: string): string {
    return this.notificationService.formatNotificationTime(dateString);
  }

  // Get lead name by ID from leadsList
  getLeadNameByLeadId(leadId: number): string {
    const lead = this.leadsList().find((l) => l.id === leadId);
    if (lead) {
      return lead.contactName;
    } else {
      return `Lead #${leadId}`;
    }
  }

  // Show all notifications/actions for a selected user
  onView(lead: any): void {
    const id = lead?.leadId ?? lead?.id;
    if (!id) {
      console.warn('onView: No leadId or id found in lead object', lead);
      return;
    }

    // Filter actions for this specific lead and map with action type info
    const actions = this.teleSalesActions();
    const leadActions =
      actions?.data?.actionsGrouped?.flatMap((group: any) =>
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

    // Format actions data for detail-view-dialog
    const actionsData: Record<string, any> = {};
    const fields: Array<{
      key: string;
      label: string;
      type?: 'text' | 'url' | 'email' | 'phone' | 'date' | 'boolean' | 'json';
    }> = [];

    leadActions.forEach((action: any, index: number) => {
      const actionNumber = index + 1;
      const actionTypeName = this.getActionTypeNameById(action);
      const actionDate = this.formatActionDate(action.actionDate);

      // Create a formatted action string with each field on a separate line
      const actionKey = `action_${actionNumber}`;
      const actionLabel = `إجراء ${actionNumber} - ${actionTypeName}`;

      // Format all attributes with each field on a separate line
      let actionValue = `النوع: ${actionTypeName}\nالتاريخ: ${actionDate}`;
      if (action.actionNotes) {
        actionValue += `\nالملاحظات: ${action.actionNotes}`;
      }

      actionsData[actionKey] = actionValue;
      fields.push({
        key: actionKey,
        label: actionLabel,
        type: 'text' as const,
      });
    });

    // Add lead information
    actionsData['leadName'] = lead.contactName || lead.name || 'غير محدد';
    actionsData['leadId'] = id;
    actionsData['totalActions'] = leadActions.length;

    fields.unshift(
      { key: 'leadName', label: 'اسم العميل', type: 'text' as const },
      { key: 'totalActions', label: 'إجمالي الإجراءات', type: 'text' as const }
    );

    const dialogData: DetailViewDialogData = {
      title: `إجراءات ${lead.contactName || lead.name || 'العميل'}`,
      data: actionsData,
      fields: fields,
    };

    this.dialog.open(DetailViewDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: dialogData,
      panelClass: 'agreement-dialog',
    });
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
    return this.actionTypeService.getActionTypeIconById(actionTypeId);
  }

  // Get action type name by ID or action object
  getActionTypeNameById(actionTypeId: number | any): string {
    return this.actionTypeService.getActionTypeNameById(actionTypeId);
  }

  getActionTypeIcon(actionTypeName: string): string {
    return this.actionTypeService.getActionTypeIcon(actionTypeName);
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
    this.actionDialogService.openActionDialog(lead, actionTypeId, (data) => {
      // Optimistically update actions list without refetch
      this.addActionToGroupedState(data);

      // Update lead in the table
      const username = this._authService.getUsername();
      if (username) {
        this.loadLeadsData(username, this.searchTerm(), this.selectedLeadStatusId());
      }
    });
  }

  // TrackBy for actions list to reduce re-rendering
  trackByAction = (_: number, action: any) =>
    action?.id ?? `${action?.actionTypeId}-${action?.actionDate}`;

  // Action button methods for table
  onCall(lead: any): void {
    this.actionDialogService.openActionDialog(lead, 1, (data) => {
      this.addActionToGroupedState(data);
    });
  }

  onEmail(lead: any): void {
    this.actionDialogService.openActionDialog(lead, 2, (data) => {
      this.addActionToGroupedState(data);
    });
  }

  onMeeting(lead: any): void {
    this.actionDialogService.openActionDialog(lead, 3, (data) => {
      this.addActionToGroupedState(data);
    });
  }

  onNote(lead: any): void {
    this.actionDialogService.openActionDialog(lead, 4, (data) => {
      this.addActionToGroupedState(data);
    });
  }

  onFollowUp(lead: any): void {
    this.actionDialogService.openActionDialog(lead, 5, (data) => {
      this.addActionToGroupedState(data);
    });
  }

  // ============================ Edit budget ================================
  onEditBudget(lead: any): void {
    if (!lead.id) return;

    this.budgetService.openBudgetEditDialog(
      lead,
      this.allPackets(),
      (newBudget) => {
        // Update in cache
        this.leadsDataService.updateLeadInCache(lead.leadId ?? lead.id, {
          budget: newBudget,
        });
        this.refreshLeadsAfterBudgetChange();
      }
    );
  }


  // Close the lead actions dialog
  closeLeadActionsDialog(): void {
    this.showLeadActionsDialog.set(false);
    this.selectedLeadActions.set([]);
    this.selectedLead.set(null);
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

  //=========================== Edit lead status ================================
  onEdit(lead: any): void {
    this.leadStatusEditor.startEditing(lead);
    this.selectedLeadForEdit.set(lead);
  }

  saveLeadStatus(lead: any): void {
    this.leadStatusEditor.saveLeadStatus(lead).subscribe({
      next: (result) => {
        if (result.success) {
          this.selectedLeadForEdit.set(null);
          // Update in cache
          this.leadsDataService.updateLeadInCache(lead.leadId ?? lead.id, {
            leadStatus: result.newStatus,
            assignLeadId: result.assignLeadId,
          });

          // If status is Confirmed, create assignment to account
          if (result.needsAccountantAssignment) {
            this.accountantService.assignToAccountant(lead, () => {
              const username = this._authService.getUsername();
              if (username) {
                this.loadLeadsData(username);
              }
            });
          }
        }
      },
    });
  }

  cancelLeadStatus(lead: any): void {
    this.leadStatusEditor.cancelEditing(lead);
    this.selectedLeadForEdit.set(null);
  }

  isEditing(lead: any): boolean {
    return this.leadStatusEditor.isEditing(lead.id);
  }

  onStatusChange(lead: any, newStatus: string): void {
    this.leadStatusEditor.onStatusChange(lead, newStatus);
  }

  onAssignLeadIdChange(lead: any, newAssignLeadId: number): void {
    lead._draftAssignLeadId = newAssignLeadId;
  }

  // ============================ Create Assign To Account ================================
  // Public method to handle assign to accountant button click
  onAssignToAccountant(lead: any): void {
    this.accountantService.assignToAccountant(lead, () => {
      // Reload leads to reflect changes
      const username = this._authService.getUsername();
      if (username) {
        this.loadLeadsData(username);
      }
    });
  }

}
