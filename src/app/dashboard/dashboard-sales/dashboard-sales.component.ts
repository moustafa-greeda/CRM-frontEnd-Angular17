import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  ITeleSalseActionResponse,
  ITeleSalseActionRequest,
} from '../../core/Models/teleSalse/itele-salse-action';
import { AuthService } from '../../Auth/auth.service';
import { LeadStatusService } from '../../core/services/common/lead-status.service';
import { FormUiComponent } from '../../shared/components/form-ui/form-ui.component';
import { MatDialog } from '@angular/material/dialog';
import { NotifyDialogService } from '../../shared/components/notify-dialog-host/notify-dialog.service';
import { GetTeleSalesTableDataRequest } from '../../core/Models/teleSalse/get-tele-sales-table-data-request';
import { ICountry } from '../../core/Models/common/icountry';
import { ICity } from '../../core/Models/common/country-city.models';
import { CountryCityService } from '../../core/services/common/country-city.service';
import { StatusColorService } from '../../core/services/common/status-color.service';
import { DateUtilsService } from '../../core/services/common/date-utils.service';
import { DashboardSalseService } from './dashboard-salse.service';
import { PakegsService } from '../../core/services/common/pakegs.service';
import { IGetAllPacket } from '../../core/Models/common/iget-all-packet';

type PacketOption = {
  id: number | null;
  name: string;
  price?: number | null;
};

@Component({
  selector: 'app-dashboard-sales',
  templateUrl: './dashboard-sales.component.html',
  styleUrls: ['./dashboard-sales.component.css', '../sharedStyleDashboard.css'],
})
export class DashboardSalesComponent implements OnInit {
  stats: any[] = [];
  searchPlaceholder = 'ابحث عن العملاء';
  listLeadStatus: any[] = [];
  leadStatusMap: Map<string, number> = new Map();
  leadsList: any[] = [];
  allLeadsCache: any[] = [];
  allPackets: PacketOption[] = [];

  actionLabels = {
    edit: 'تعديل الميزانية',
  };

  columns: any[] = [
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
  ];
  // Filters
  countryList: ICountry[] = [];
  cityList: ICity[] = [];
  actionDateFilterOptions: string[] = ['اليوم', 'آخر 7 أيام', 'آخر 30 يوم'];
  selectedActionDateFilter: string = '--';
  actionDisplayMode: 'inline' | 'dropdown' = 'dropdown';

  // Derived option lists for dropdowns (template-safe)
  get countryNames(): string[] {
    return (this.countryList || []).map((c: any) => c?.name).filter(Boolean);
  }

  get cityNames(): string[] {
    return (this.cityList || []).map((c: any) => c?.name).filter(Boolean);
  }

  get packetDropdownOptions(): PacketOption[] {
    return [
      { id: null, name: 'لم تحدد', price: null },
      ...(this.allPackets || []),
    ];
  }

  get defaultPacketOption(): PacketOption {
    return { id: null, name: 'لم تحدد', price: null };
  }

  normalizePacketOption(
    packet: {
      id: number | string | null;
      name: string;
      price?: number | null;
    } | null
  ): PacketOption | null {
    if (!packet) {
      return null;
    }

    return {
      id: this.normalizePacketIdValue(packet.id),
      name: packet.name,
      price: packet.price ?? null,
    };
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
  // Persisted filters for refreshing actions after create
  private actionsStartDate?: string;
  private actionsEndDate?: string;

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

    // Force change detection with new references
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

    // If the actions dialog is open for the same lead, update it too
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

    // Also reflect in recent interactions (optimistic) - match component schema
    if (Array.isArray(this.recentInteractions)) {
      const actionTypeKey = this.getActionTypeKeyById(action.actionTypeId); // 'Call' | 'Email' ...
      const contactName =
        this.selectedLead?.contactName ||
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

    // Force change detection for OnPush views
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

  constructor(
    private _dashboardService: DashboardSalseService,
    private _authService: AuthService,
    private _leadStatusService: LeadStatusService,
    private _pakegsService: PakegsService,
    private dialog: MatDialog,
    private notify: NotifyDialogService,
    private _countryCityService: CountryCityService,
    private statusColorService: StatusColorService,
    private dateUtils: DateUtilsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Get username from auth service
    const username = this._authService.getUsername();

    forkJoin({
      totalLeadsAssignments: this._dashboardService.LeadAssignmentsCountSales(),
      closedLeads: this._dashboardService.GetMyClosedLeads(),
      TotalMoney: this._dashboardService.GetTotalMoney(),
      AverageCallDuration: this._dashboardService.GetWaitingForFollowUp(),
    }).subscribe((res) => {
      const budgets = res.TotalMoney.data.budgets as Array<{
        totalBudget: number;
        currency: string;
      }>;
      const totalBudget = budgets.reduce(
        (acc: number, budget: { totalBudget: number }) =>
          acc + budget.totalBudget,
        0
      );

      // Combine all budget values into a single card with multiple counts
      const budgetDetails = budgets
        .map((budget) => `${budget.totalBudget} ${budget.currency}`)
        .join(' , ');

      this.stats = [
        {
          title: 'اجمالي العملاء',
          count: res.totalLeadsAssignments.data.count,
          icon: 'bi bi-person-lines-fill',
        },
        {
          title: 'الصفقات المغلقة',
          count: res.closedLeads.data.closedLeadsCount,
          icon: 'bi bi-exclamation-triangle',
        },
        {
          title: 'القيمة الإجمالية',
          count: `${budgetDetails} | الإجمالي: ${totalBudget}`, // Combined budgets and total
          icon: 'bi bi-cash-coin',
        },
        {
          title: 'في انتظار المتابعة',
          count: res.AverageCallDuration.data.leadAssignmentsCount,
          icon: 'bi bi-bar-chart',
        },
      ];

      // call get list lead status
      this.getListLeadStatus();
    });
    // call get list lead status
    this.getListLeadStatus();

    // Load tele sales actions
    this.loadSalesActions();

    // Load recent interactions
    this.loadRecentInteractions();

    // Load notifications
    this.loadNotifications();

    // Load countries
    this.loadCountries();

    // Load packet options
    this.loadAllPackets();

    // Load leads data
    if (username) {
      this.loadLeadsData(username);
    }
  }
  //========================================= load all packets ===========================================
  loadAllPackets(): void {
    // Subscribe to the packets observable
    this._pakegsService.packets$.subscribe((packets) => {
      this.allPackets = packets;
      this.refreshPacketAssignments();
    });
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

  onPacketSelected(row: any, packet: PacketOption | null): void {
    if (!row) {
      return;
    }

    const previousPacketId = row.packetId ?? null;
    const previousPacket = row.packet;

    const packetIdValue =
      packet?.id === undefined || packet?.id === null
        ? null
        : typeof packet.id === 'string'
        ? Number(packet.id)
        : packet.id;
    const normalizedPacketId =
      typeof packetIdValue === 'number' && !Number.isNaN(packetIdValue)
        ? packetIdValue
        : null;

    row.packetId = normalizedPacketId;
    row.packet = packet;

    const assignmentId = row?.id ?? row?.leadId ?? row?.assignmentId;
    if (!assignmentId || normalizedPacketId === null) {
      row.packetId = previousPacketId;
      row.packet = previousPacket;
      this.notify.open({
        type: 'error',
        title: 'خطأ',
        description: 'يجب اختيار باقة صالحة لتحديث الميزانية.',
      });
      return;
    }

    const selectedPacket =
      this.allPackets.find(
        (opt) => (opt.id ?? null) === (normalizedPacketId ?? null)
      ) || null;
    const packetPrice = Number(selectedPacket?.price ?? NaN);

    this._dashboardService
      .updateSalesBudget(assignmentId, normalizedPacketId)
      .subscribe({
        next: () => {
          if (Number.isFinite(packetPrice)) {
            row.budget = packetPrice;
          }
          const cached = this.allLeadsCache.find(
            (lead) => (lead.leadId ?? lead.id) === assignmentId
          );
          if (cached) {
            if (Number.isFinite(packetPrice)) {
              cached.budget = packetPrice;
            }
            cached.packetId = normalizedPacketId;
            cached.packet = packet;
          }

          this.notify.open({
            type: 'success',
            title: 'تم التحديث',
            description: 'تم تحديث الميزانية بناءً على الباقة المختارة.',
          });

          this.refreshLeadsAfterBudgetChange();
        },
        error: () => {
          row.packetId = previousPacketId;
          row.packet = previousPacket;
          this.notify.open({
            type: 'error',
            title: 'خطأ',
            description: 'تعذر تحديث الميزانية، يرجى المحاولة لاحقاً.',
          });
        },
      });
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

  private normalizePacketIdValue(rawId: any): number | null {
    if (rawId === null || rawId === undefined || rawId === '') {
      return null;
    }
    const numericValue =
      typeof rawId === 'string'
        ? Number(rawId)
        : typeof rawId === 'number'
        ? rawId
        : typeof rawId?.id === 'number'
        ? rawId.id
        : Number(rawId?.id ?? rawId);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  private resolvePacketOption(
    packetId: number | null,
    fallbackName?: string,
    fallbackPrice?: number | null
  ): PacketOption | null {
    if (packetId === null) {
      return null;
    }
    const fromList = this.allPackets.find((opt) => opt.id === packetId);
    if (fromList) {
      return fromList;
    }
    if (fallbackName) {
      return {
        id: packetId,
        name: fallbackName,
        price: fallbackPrice ?? null,
      };
    }
    return null;
  }

  private resolvePacketByBudget(budget: number | null): PacketOption | null {
    if (budget === null || budget === undefined) {
      return null;
    }

    const numericBudget = Number(budget);
    if (!Number.isFinite(numericBudget)) {
      return null;
    }

    const byIdMatch =
      this.allPackets.find((opt) => Number(opt.id) === numericBudget) ?? null;
    if (byIdMatch) {
      return byIdMatch;
    }

    const byPriceMatch =
      this.allPackets.find((opt) =>
        Number.isFinite(Number(opt.price))
          ? Number(opt.price) === numericBudget
          : false
      ) ?? null;

    return byPriceMatch;
  }

  private attachPacketInfo(lead: any): any {
    const rawPacketId = lead.packetId ?? lead.packet?.id ?? null;
    const normalizedPacketId = this.normalizePacketIdValue(rawPacketId);
    const packetName = lead.packetName || lead.packet?.name || null;
    const packetPrice =
      lead.packet?.price ?? lead.packetPrice ?? lead.productPrice ?? null;
    const packetOption =
      this.resolvePacketOption(
        normalizedPacketId,
        packetName ?? undefined,
        packetPrice
      ) ?? this.resolvePacketByBudget(lead?.budget ?? null);
    const finalPacketId = packetOption?.id ?? normalizedPacketId;
    return {
      ...lead,
      packetId: finalPacketId,
      packet: packetOption,
    };
  }

  private refreshPacketAssignments(): void {
    if (this.leadsList?.length) {
      this.leadsList = this.leadsList.map((lead) =>
        this.attachPacketInfo(lead)
      );
    }
    if (this.allLeadsCache?.length) {
      this.allLeadsCache = this.allLeadsCache.map((lead) =>
        this.attachPacketInfo(lead)
      );
    }
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

    this.currentPage = event.pageIndex + 1;

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

  private refreshLeadsAfterBudgetChange(): void {
    const username = this._authService.getUsername();
    if (!username) {
      return;
    }

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
      country: '',
      city: '',
      lastActionTime: '',
      actionNote: '',
      // Align with teleSales: API expects 1-based page index
      pageIndex: this.currentPage,
      pageSize: this.pageSize,
    };

    this._dashboardService.getLeadsBelongsToSales(payload).subscribe({
      next: (response) => {
        if (response && response.data) {
          const responseData = response.data as any;
          const items = Array.isArray(responseData.items)
            ? responseData.items
            : Array.isArray(responseData)
            ? responseData
            : [];

          // Sync paginator from backend response when available
          const apiPageIndex = Number(
            (responseData as any).pageIndex ?? (responseData as any).PageIndex
          );
          if (!Number.isNaN(apiPageIndex) && apiPageIndex > 0) {
            this.currentPage = apiPageIndex;
          } else if (apiPageIndex === 0) {
            // normalize 0-based to 1-based UI
            this.currentPage = 1;
          }

          const apiPageSize = Number(
            (responseData as any).pageSize ?? (responseData as any).PageSize
          );
          if (!Number.isNaN(apiPageSize) && apiPageSize > 0) {
            this.pageSize = apiPageSize;
          }

          this.totalCount = Number(
            (responseData as any).totalCount ??
              (responseData as any).TotalCount ??
              items.length ??
              0
          );

          // Assign page items directly (server-side paging), with date formatting
          this.leadsList = (items || []).map((lead: any) => {
            // Get leadStatus from various possible field names
            const rawStatus =
              lead.leadStatus || lead.leadstatus || lead.LeadStatus || '';

            // Try to match with leadStatusOptions (case-insensitive)
            let matchedStatus = rawStatus;
            if (rawStatus && this.leadStatusOptions.length > 0) {
              const found = this.leadStatusOptions.find(
                (opt) => opt.toLowerCase() === rawStatus.toLowerCase()
              );
              if (found) {
                matchedStatus = found; // Use the exact option from list
              }
            }

            return this.attachPacketInfo({
              ...lead,
              assignmentId: lead.id, // persist assignment id from GetSalesTableData
              leadId: lead.leadId || lead.id,
              assignDate: lead.assignDate || lead.assigndate || '', // Keep original for formatter
              assigndate: lead.assignDate || lead.assigndate || '', // Also keep for compatibility
              lastActionTime: lead.lastActionTime || lead.assignDate || '', // Keep original for formatter
              leadStatus: matchedStatus,
              city: lead.city || '',
              country: lead.country || '',
              actionNote: lead.notes || lead.actionNote || '',
            });
          });

          // Update cache
          this.allLeadsCache = [...this.leadsList];
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

  loadSalesActions(
    employeeId: number = 11,
    startDate?: string,
    endDate?: string
  ): void {
    this.loadingActions = true;
    // Store provided dates if passed; otherwise reuse last ones
    if (startDate !== undefined) this.actionsStartDate = startDate;
    if (endDate !== undefined) this.actionsEndDate = endDate;

    const effectiveStart = this.actionsStartDate;
    const effectiveEnd = this.actionsEndDate;

    this._dashboardService
      .getSalesActions(employeeId, effectiveStart, undefined, effectiveEnd)
      .subscribe({
        next: (response: any) => {
          this.teleSalesActions = response;
          this.loadingActions = false;
        },
        error: () => {
          this.loadingActions = false;
        },
      });
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
    if (!lead) {
      return;
    }

    // Actions are keyed by the actual leadId, not the assignment id (row.id)
    const keyLeadId = lead.leadId ?? lead.id;

    // Filter actions for this specific lead and map with action type info
    const leadActions =
      this.teleSalesActions?.data?.actionsGrouped?.flatMap((group: any) =>
        group.actions
          .filter((action: any) => (action.leadId ?? action.id) === keyLeadId)
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
        this.createSalesAction(requestData);

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

  // ============================ Edit budget ================================
  onEditBudget(lead: any): void {
    // API expects the assignment row id, which is available as `id`
    const id = lead.id;
    if (!lead.id) return;

    const dialogRef = this.dialog.open(FormUiComponent, {
      width: '500px',
      panelClass: 'agreement-dialog',
      data: {
        config: {
          title: 'تحديث الميزانية',
          submitText: 'حفظ',
          cancelText: 'إلغاء',
          fields: [
            {
              name: 'budget',
              label: 'الميزانية',
              // type: 'number',
              type: 'select',
              options: this.allPackets.map((packet) => ({
                label: packet.name,
                value: packet.id,
              })),
              required: true,
              placeholder: 'أدخل الميزانية',
              colSpan: 3,
            },
          ],
        },
        initialData: {
          budget: lead.budget,
        },
      },
      // this.,
    });

    dialogRef.componentInstance.formSubmit.subscribe((formData) => {
      const value = Number(formData?.budget);
      if (!Number.isFinite(value) || value < 0) {
        this.notify.open({
          type: 'error',
          title: 'خطأ',
          description: 'يرجى إدخال ميزانية صحيحة',
        });
        return;
      }

      this._dashboardService.updateSalesBudget(id, value).subscribe({
        next: () => {
          // Update row and cache
          lead.budget = value;
          const cached = this.allLeadsCache.find(
            (l) => (l.leadId ?? l.id) === id
          );
          if (cached) cached.budget = value;

          this.notify.open({
            type: 'success',
            title: 'تم بنجاح',
            description: 'تم تحديث الميزانية بنجاح',
          });
          dialogRef.close();
          this.refreshLeadsAfterBudgetChange();
        },
        error: (error) => {
          const msg =
            error?.error?.validationErrors?.[0]?.errorMessage ||
            error?.error?.message ||
            error?.message ||
            'فشل تحديث الميزانية';
          this.notify.open({ type: 'error', title: 'خطأ', description: msg });
        },
      });
    });

    dialogRef.afterClosed().subscribe(() => {
      dialogRef.componentInstance.formSubmit.unsubscribe();
    });
  }

  private createSalesAction(data: ITeleSalseActionRequest): void {
    // Show loading state
    this.isSearching = true;

    this._dashboardService.createSalesAction(data).subscribe({
      next: (response: any) => {
        this.isSearching = false;
        if (response.succeeded) {
          this.notify.open({
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

          // Optimistically update actions list without refetch
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
    const assignLeadId = lead.id || this._authService.getEmployeeId() || 1; // Final fallback

    // Build payload with required fields
    const payload: any = {
      assignmentId: lead.assignmentId ?? lead.id, // ensure from GetSalesTableData
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

          // If status is Confirmed, create assignment to account
          if (newStatus === 'Confirmed') {
            this.createAssignToAccount(lead);
          }

          this.notify.open({
            type: 'success',
            title: 'نجح',

            description:
              newStatus === 'Confirmed'
                ? 'تم تحويل العميل الي قسم الحسابات '
                : 'تم تحديث حالة العميل المحتمل بنجاح',
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

  // ============================ Create Assign To Account ================================
  private createAssignToAccount(lead: any): void {
    const employeeId = this._authService.getEmployeeId();

    if (!employeeId) {
      console.error('Could not get employee ID');
      return;
    }

    this.sendAssignToAccountRequest(lead, String(employeeId));
  }

  private sendAssignToAccountRequest(lead: any, assignedByEmp: string): void {
    const leadId = lead.leadId;
    const notes = lead.actionNote || lead.notes || '';
    const budgetValue = Number(lead.budget) || 0;
    const currency = lead.currencyName || '';
    const isInWorkOrder = false;

    const payload = {
      assignedByEmp: assignedByEmp,
      leadId: leadId,
      notes: notes,
      buddgetValue: budgetValue,
      currncy: currency,
      isInWorkOrder: isInWorkOrder,
    };

    this._dashboardService.createAssignToAccount(payload).subscribe({
      next: (response) => {
        if (response && response.succeeded !== false) {
          // Successfully assigned to account
          console.log('Successfully assigned to account:', response);
        }
      },
      error: (error) => {
        console.error('Error creating assign to account:', error);
        // Don't show error to user as lead status was already updated successfully
      },
    });
  }
}
