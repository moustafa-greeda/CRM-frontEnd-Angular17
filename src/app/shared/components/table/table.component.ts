import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Renderer2,
} from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

interface TablePacketOption {
  id: number | string | null;
  name: string;
  price?: number | null;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements AfterViewInit, OnDestroy {
  @Input() data: any[] = [];
  @Input() columns: {
    key: string;
    header: string;
    width?: string;
    formatter?: 'date' | 'datetime';
  }[] = [];
  @Input() selectedRows: any[] = [];
  @Input() pageSize = 10;
  @Input() currentPage = 1;
  @Input() showDataTable = true;
  @Input() hasNoData = false;
  @Input() totalCount: number = 0;
  @Input() noDataMessage: string = '';
  // Public class names for styling from parent components
  @Input() tableClass: string = '';
  @Input() containerClass: string = '';
  // Action visibility
  @Input() showCheckbox: boolean = false;
  @Input() showView: boolean = false;
  @Input() showEdit: boolean = false;
  @Input() showDelete: boolean = false;
  @Input() showIndex: boolean = false;
  @Input() showChat: boolean = false;
  @Input() showEmail: boolean = false;
  @Input() showNote: boolean = false;
  @Input() showAdd: boolean = false;
  @Input() showCall: boolean = false;
  @Input() showMeeting: boolean = false;
  @Input() showFollowUp: boolean = false;
  @Input() addButton: boolean = false;
  // Actions display mode: 'inline' buttons or single dropdown menu
  @Input() actionDisplayMode: 'inline' | 'dropdown' = 'inline';
  // Custom action labels for dropdown menu
  @Input() actionLabels: {
    view?: string;
    edit?: string;
    delete?: string;
    add?: string;
    chat?: string;
    email?: string;
    note?: string;
    call?: string;
    meeting?: string;
    followUp?: string;
  } = {};

  // Custom action titles (tooltips) for inline icons
  @Input() actionTitles: {
    view?: string;
    edit?: string;
    delete?: string;
    add?: string;
    chat?: string;
    email?: string;
    note?: string;
    call?: string;
    meeting?: string;
    followUp?: string;
  } = {};

  // Lead status editing properties
  @Input() leadStatusOptions: string[] = [];
  @Input() editingLeadId: number | null = null;
  // Force leadStatus column to render as dropdown by default
  @Input() alwaysEditLeadStatus: boolean = false;
  // Optional color map for status options
  @Input() leadStatusColorMap: Record<string, string> = {};
  // Key used to uniquely identify rows when tracking selection
  @Input() rowIdentityKey: string = 'id';
  // Optional packet selection dropdown
  @Input() packetOptions: TablePacketOption[] = [];
  @Input() defaultPacket: TablePacketOption | null = null;

  // Track last emitted event to prevent duplicates
  private lastEmittedPageIndex: number = -1;
  private lastEmittedPageSize: number = -1;
  private documentClickUnlisten?: () => void;

  // Getter for pageIndex (MatPaginator is 0-based); currentPage is 1-based
  get pageIndex(): number {
    const totalPages = Math.max(1, Math.ceil(this.totalCount / this.pageSize));
    const zeroBased = this.currentPage - 1;
    return Math.max(0, Math.min(zeroBased, totalPages - 1));
  }

  // Get total number of pages
  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  // Check if on first page
  get isFirstPage(): boolean {
    return this.currentPage === 1;
  }

  // Check if on last page
  get isLastPage(): boolean {
    return this.currentPage >= this.totalPages || this.totalPages === 0;
  }

  @Output() rowSelectionChange = new EventEmitter<{
    row: any;
    selected: boolean;
  }>();
  @Output() selectAllChange = new EventEmitter<boolean>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() view = new EventEmitter<any>();
  @Output() rowDragStart = new EventEmitter<any>();
  @Output() chat = new EventEmitter<any>();
  @Output() email = new EventEmitter<any>();
  @Output() note = new EventEmitter<any>();
  @Output() call = new EventEmitter<any>();
  @Output() meeting = new EventEmitter<any>();
  @Output() followUp = new EventEmitter<any>();
  @Output() leadStatusClick = new EventEmitter<any>();
  @Output() statusChange = new EventEmitter<{ row: any; status: string }>();
  @Output() saveLeadStatus = new EventEmitter<any>();
  @Output() cancelLeadStatus = new EventEmitter<any>();
  @Output() packetSelected = new EventEmitter<{
    row: any;
    packet: TablePacketOption | null;
  }>();
  @Output() addButtonClick = new EventEmitter<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Dropdown state for per-row action menu
  openDropdownRowIndex: number | null = null;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    // Listen for page changes (includes page size changes)
    if (this.paginator) {
      this.paginator.page.subscribe((event: PageEvent) => {
        if (event.pageSize && event.pageSize !== this.pageSize) {
          this.pageSizeChange.emit(event.pageSize);
        }
        this.pageChange.emit(event);
      });
    }

    // Close dropdown when clicking outside
    this.documentClickUnlisten = this.renderer.listen(
      'document',
      'click',
      (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        if (
          !target.closest('.action-buttons') &&
          !target.closest('.dropdown-menu')
        ) {
          this.openDropdownRowIndex = null;
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.documentClickUnlisten) {
      this.documentClickUnlisten();
      this.documentClickUnlisten = undefined;
    }
  }

  isRowSelected(row: any) {
    const rowId = this.getRowIdentity(row);
    return this.selectedRows.some(
      (selectedRow) => this.getRowIdentity(selectedRow) === rowId
    );
  }

  isAllSelected() {
    return (
      this.data.length > 0 && this.data.every((row) => this.isRowSelected(row))
    );
  }

  getRowIndex(index: number): number {
    // Calculate the actual row number in the dataset
    // currentPage is 1-based, so we need to subtract 1 to get 0-based page index
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  onRowSelectionChange(row: any, event: Event) {
    const target = event.target as HTMLInputElement;
    this.rowSelectionChange.emit({ row, selected: target?.checked || false });
  }

  onRowClick(row: any, event: Event) {
    // Prevent selection when clicking on checkboxes or action buttons
    const target = event.target as HTMLElement;
    if (
      target.closest('input[type="checkbox"]') ||
      target.closest('.action-btn')
    ) {
      return;
    }

    // Toggle row selection
    const isSelected = this.isRowSelected(row);
    this.rowSelectionChange.emit({ row, selected: !isSelected });
  }

  onSelectAllChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.selectAllChange.emit(target?.checked || false);
  }

  private getRowIdentity(row: any): any {
    if (!row || typeof row !== 'object') {
      return row;
    }

    const key = this.rowIdentityKey;
    if (key && row.hasOwnProperty(key)) {
      return row[key];
    }

    // fallback to common identifiers
    if (row.id !== undefined) {
      return row.id;
    }
    if (row.key !== undefined) {
      return row.key;
    }
    return JSON.stringify(row);
  }

  onPageChange(event: any) {
    // Prevent pagination if no data
    if (this.totalCount === 0) {
      return;
    }

    // Prevent duplicate events
    if (
      this.lastEmittedPageIndex === event.pageIndex &&
      this.lastEmittedPageSize === (event.pageSize || this.pageSize)
    ) {
      return;
    }

    // Check if page size changed and emit pageSizeChange event
    if (event.pageSize && event.pageSize !== this.pageSize) {
      this.pageSize = event.pageSize;
      this.pageSizeChange.emit(event.pageSize);
      this.lastEmittedPageIndex = event.pageIndex;
      this.lastEmittedPageSize = event.pageSize;
      // Don't emit pageChange if only pageSize changed
      return;
    }

    // Update tracking
    this.lastEmittedPageIndex = event.pageIndex;
    this.lastEmittedPageSize = this.pageSize;

    // Emit the page change event to parent component
    // The parent will handle updating currentPage
    this.pageChange.emit(event);
  }

  onPageSizeChange(event: any) {
    // Handle page size change
    const newPageSize = event.pageSize || event;
    this.pageSizeChange.emit(newPageSize);
  }

  onDragStartRow(row: any, event: DragEvent) {
    // Allow dragging any row
    const ids: string[] =
      Array.isArray(this.selectedRows) && this.selectedRows.length > 0
        ? this.selectedRows.map((r) => r?.id).filter(Boolean)
        : [row?.id];
    try {
      event.dataTransfer?.setData('application/json', JSON.stringify(ids));
    } catch {}
    // Fallback single id for compatibility
    event.dataTransfer?.setData('text/plain', row?.id ?? '');
    this.rowDragStart.emit(row);
  }

  onAddButton(row: any) {
    this.addButtonClick.emit(row);
  }

  // Alias used by inline actions template
  onAdd(row: any) {
    this.addButtonClick.emit(row);
  }

  onEdit(row: any) {
    this.edit.emit(row);
  }

  onDelete(row: any) {
    this.delete.emit(row);
  }

  onView(row: any) {
    this.view.emit(row);
  }
  onChat(row: any) {
    this.chat.emit(row);
  }
  onEmail(row: any) {
    this.email.emit(row);
  }

  onNote(row: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.note.emit(row);
  }

  onCall(row: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.call.emit(row);
  }

  onMeeting(row: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.meeting.emit(row);
  }

  onFollowUp(row: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.followUp.emit(row);
  }

  dropdownPosition: { top: number; left: number } = { top: 0, left: 0 };

  toggleDropdown(rowIndex: number, event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    const wasOpen = this.openDropdownRowIndex === rowIndex;
    this.openDropdownRowIndex = wasOpen ? null : rowIndex;

    // Position the dropdown with fixed coordinates to avoid overflow clipping
    if (!wasOpen) {
      const target = event.currentTarget as HTMLElement;
      if (target) {
        const rect = target.getBoundingClientRect();
        // Place menu below the button - use getBoundingClientRect which gives viewport coordinates
        this.dropdownPosition.top = rect.bottom + 4;
        // Align right edge of menu with right edge of button
        this.dropdownPosition.left = rect.right - 160; // 160px ~ menu width
      }
    }
  }

  // Get status class based on lead status name
  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      // English statuses
      new: 'status-new',
      qualified: 'status-qualified',
      'proposal sent': 'status-proposal',
      negotiation: 'status-negotiation',
      closed: 'status-closed',
      lost: 'status-lost',
      contacted: 'status-contacted',
      'follow up': 'status-followup',
      meeting: 'status-meeting',
      call: 'status-call',
      email: 'status-email',
      pending: 'status-pending',

      // Arabic statuses
      جديد: 'status-new',
      مؤهل: 'status-qualified',
      'تم الإرسال': 'status-proposal',
      مقترح: 'status-proposal',
      متوقع: 'status-qualified',
      اتصال: 'status-call',
      'في انتظار': 'status-pending',
      مغلق: 'status-closed',
      مفقود: 'status-lost',
      'تم الاتصال': 'status-contacted',
      متابعة: 'status-followup',
      اجتماع: 'status-meeting',
      'بريد إلكتروني': 'status-email',
    };

    // Convert to lowercase for comparison
    const lowerStatus = status?.toLowerCase() || '';
    return statusMap[lowerStatus] || 'status-default';
  }

  // Get lead status name for display
  getLeadStatusDisplay(status: string): string {
    // You can add custom formatting here if needed
    return status || '-';
  }

  // Get action label for dropdown
  getActionLabel(action: string): string {
    const defaultLabels: Record<string, string> = {
      view: 'عرض التفاصيل',
      edit: 'تعديل',
      delete: 'حذف',
      add: 'إضافة',
      chat: 'محادثة',
      email: 'بريد',
      note: 'ملاحظة',
      call: 'مكالمة',
      meeting: 'اجتماع',
      followUp: 'متابعة',
    };
    return (
      this.actionLabels[action as keyof typeof this.actionLabels] ||
      defaultLabels[action] ||
      ''
    );
  }

  // Get action title (tooltip) for inline icons
  getActionTitle(action: string): string {
    const defaultTitles: Record<string, string> = {
      view: 'عرض التفاصيل',
      edit: 'تعديل',
      delete: 'حذف',
      add: 'إضافة',
      chat: 'محادثة',
      email: 'بريد إلكتروني',
      note: 'ملاحظة',
      call: 'مكالمة',
      meeting: 'اجتماع',
      followUp: 'متابعة',
    };
    return (
      this.actionTitles[action as keyof typeof this.actionTitles] ||
      defaultTitles[action] ||
      ''
    );
  }

  // Get lead status options with current value included
  getLeadStatusOptionsWithCurrent(row: any): string[] {
    const currentStatus = row._draftLeadStatus || row.leadStatus;
    if (!currentStatus) return this.leadStatusOptions;

    // Check if current status is already in options
    const isInOptions = this.leadStatusOptions.some(
      (opt) => opt.toLowerCase() === currentStatus.toLowerCase()
    );

    // If not in options, add it to the beginning
    if (!isInOptions) {
      return [currentStatus, ...this.leadStatusOptions];
    }

    return this.leadStatusOptions;
  }

  // Format cell value based on formatter type
  formatCellValue(value: any, formatter?: string): string {
    if (!value) return '-';

    if (formatter === 'date' || formatter === 'datetime') {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value; // Invalid date

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

  // Lead status editing methods
  isEditingLeadStatus(row: any): boolean {
    if (this.alwaysEditLeadStatus) {
      return true;
    }
    return this.editingLeadId === row.id;
  }

  onLeadStatusClick(row: any): void {
    this.leadStatusClick.emit(row);
  }

  onStatusChange(row: any, newStatus: string): void {
    this.statusChange.emit({ row, status: newStatus });
  }

  onSaveLeadStatus(row: any): void {
    // Update the draft status and emit save event
    this.saveLeadStatus.emit(row);

    // Close editing mode after save
    this.editingLeadId = null;
  }

  onCancelLeadStatus(row: any): void {
    this.cancelLeadStatus.emit(row);
  }

  get packetOptionsWithFallback(): TablePacketOption[] {
    const options = Array.isArray(this.packetOptions)
      ? [...this.packetOptions]
      : [];
    if (
      this.defaultPacket &&
      !options.some(
        (opt) =>
          this.serializePacketId(opt.id) ===
          this.serializePacketId(this.defaultPacket?.id)
      )
    ) {
      return [this.defaultPacket, ...options];
    }
    return options;
  }

  getInvoiceStatusClass(status: string | null | undefined): string {
    if (!status) {
      return 'status-chip-neutral';
    }

    const normalized = status.toLowerCase().trim();

    if (['مدفوعة', 'paid', 'paid-in-full'].includes(status)) {
      return 'status-chip-paid';
    }
    if (['غير مدفوعة', 'unpaid', 'overdue', 'متأخرة'].includes(status)) {
      return 'status-chip-unpaid';
    }
    if (['قيد المراجعة', 'under review', 'pending'].includes(status)) {
      return 'status-chip-pending';
    }
    if (['ملغاة', 'cancelled', 'canceled'].includes(status)) {
      return 'status-chip-cancelled';
    }

    return 'status-chip-neutral';
  }

  getPacketOptionsForRow(row: any): TablePacketOption[] {
    const options = this.packetOptionsWithFallback.slice();
    const rowPacket = row?.packet;
    const rowPacketId = this.serializePacketId(
      rowPacket?.id ?? row?.packetId ?? null
    );
    if (
      rowPacket &&
      !options.some((opt) => this.serializePacketId(opt.id) === rowPacketId)
    ) {
      options.unshift({
        id: rowPacket.id ?? null,
        name: rowPacket.name ?? 'لم تحدد',
        price: rowPacket.price ?? null,
      });
    }
    return options;
  }

  getPacketValue(row: any): string {
    if (!row) return 'null';

    const packetId = Number(row?.budget ?? null);

    if (!Number.isFinite(packetId) || packetId === 0) {
      return 'null';
    }

    return String(packetId);
  }

  serializePacketId(id: number | string | null | undefined): string {
    if (id === null || id === undefined) {
      return 'null';
    }
    return String(id);
  }

  onPacketChange(row: any, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedValue = select.value;
    const packet =
      this.packetOptions.find(
        (opt) => this.serializePacketId(opt.id) === selectedValue
      ) ||
      this.defaultPacket ||
      null;
    this.packetSelected.emit({ row, packet });
  }

  getPacketDisplayLabel(row: any): string {
    const label = row?.packet?.name || row?.packetName || null;
    return label && String(label).trim().length > 0 ? String(label) : 'لم تحدد';
  }

  getPacketDisplayPrice(row: any): string | null {
    if (!row) {
      return null;
    }
    const priceSource = row.packet?.price ?? null;
    if (
      priceSource === null ||
      priceSource === undefined ||
      priceSource === ''
    ) {
      return null;
    }
    const numericPrice = Number(priceSource);
    const priceText = Number.isFinite(numericPrice)
      ? numericPrice.toLocaleString('en-US', { maximumFractionDigits: 2 })
      : String(priceSource);
    const currency =
      row.currencyName ||
      row.currency ||
      row.currency_name ||
      row.currencyCode ||
      '';
    return currency ? `${priceText} ${currency}` : priceText;
  }
}
