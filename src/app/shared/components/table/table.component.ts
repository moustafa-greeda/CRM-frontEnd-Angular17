import {
  Component,
  input,
  output,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  Renderer2,
  signal,
  computed,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatPaginator, PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { TableDropdownComponent } from '../../ui/table-dropdown/table-dropdown.component';

interface TablePacketOption {
  id: number | string | null;
  name: string;
  price?: number | null;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, RouterModule, MatPaginatorModule, TableDropdownComponent],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements AfterViewInit, OnDestroy {
  private readonly renderer = inject(Renderer2);
  // ========================================
  // 📥 Input Signals - Data
  // ========================================
  readonly data = input<any[]>([]);
  readonly columns = input<{
    key: string;
    header: string;
    width?: string;
    formatter?: 'date' | 'datetime' | 'booleanYesNo';
  }[]>([]);
  readonly selectedRows = input<any[]>([]);
  readonly pageSize = input<number>(10);
  readonly currentPage = input<number>(1);
  readonly showDataTable = input<boolean>(true);
  readonly hasNoData = input<boolean>(false);
  readonly totalCount = input<number>(0);
  readonly noDataMessage = input<string>('');
  readonly tableClass = input<string>('');
  readonly containerClass = input<string>('');

  // ========================================
  // 📥 Input Signals - Action Visibility
  // ========================================
  readonly showCheckbox = input<boolean>(false);
  readonly showView = input<boolean>(false);
  readonly showEdit = input<boolean>(false);
  readonly showDelete = input<boolean>(false);
  readonly showIndex = input<boolean>(false);
  readonly showChat = input<boolean>(false);
  readonly showEmail = input<boolean>(false);
  readonly showNote = input<boolean>(false);
  readonly showAdd = input<boolean>(false);
  readonly showCall = input<boolean>(false);
  readonly showMeeting = input<boolean>(false);
  readonly showFollowUp = input<boolean>(false);
  readonly showAssignToAccountant = input<boolean>(false);
  readonly addButton = input<boolean>(false);
  readonly actionDisplayMode = input<'inline' | 'dropdown'>('inline');
  readonly actionLabels = input<{
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
    assignToAccountant?: string;
  }>({});
  readonly actionTitles = input<{
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
    assignToAccountant?: string;
  }>({});
  readonly leadStatusOptions = input<string[]>([]);
  readonly editingLeadId = input<number | null>(null);
  readonly alwaysEditLeadStatus = input<boolean>(false);
  readonly leadStatusColorMap = input<Record<string, string>>({});
  readonly rowIdentityKey = input<string>('id');
  readonly packetOptions = input<TablePacketOption[]>([]);
  readonly defaultPacket = input<TablePacketOption | null>(null);
  readonly employeeSalesOptions = input<string[]>([]);

  // ========================================
  // 📤 Output Signals
  // ========================================
  readonly rowSelectionChange = output<{ row: any; selected: boolean }>();
  readonly selectAllChange = output<boolean>();
  readonly pageChange = output<PageEvent>();
  readonly pageSizeChange = output<number>();
  readonly edit = output<any>();
  readonly delete = output<any>();
  readonly view = output<any>();
  readonly rowDragStart = output<any>();
  readonly chat = output<any>();
  readonly email = output<any>();
  readonly note = output<any>();
  readonly call = output<any>();
  readonly meeting = output<any>();
  readonly followUp = output<any>();
  readonly leadStatusClick = output<any>();
  readonly statusChange = output<{ row: any; status: string }>();
  readonly saveLeadStatus = output<any>();
  readonly cancelLeadStatus = output<any>();
  readonly packetSelected = output<{
    row: any;
    packet: TablePacketOption | null;
  }>();
  readonly addButtonClick = output<any>();
  readonly assignToAccountant = output<any>();
  readonly employeeSalesChange = output<{
    row: any;
    employeeSales: string;
  }>();

  // ========================================
  // 🔄 Internal State Signals
  // ========================================
  private readonly lastEmittedPageIndex = signal<number>(-1);
  private readonly lastEmittedPageSize = signal<number>(-1);
  readonly openDropdownRowIndex = signal<number | null>(null);
  readonly dropdownPosition = signal<{ top: number; left: number }>({ top: 0, left: 0 });

  // ========================================
  // 💡 Computed Signals
  // ========================================
  readonly pageIndex = computed(() => {
    const totalCount = this.totalCount();
    const pageSize = this.pageSize();
    const currentPage = this.currentPage();
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const zeroBased = currentPage - 1;
    return Math.max(0, Math.min(zeroBased, totalPages - 1));
  });

  readonly totalPages = computed(() =>
    Math.ceil(this.totalCount() / this.pageSize())
  );

  readonly isFirstPage = computed(() => this.currentPage() === 1);

  readonly isLastPage = computed(() => {
    const currentPage = this.currentPage();
    const totalPages = this.totalPages();
    return currentPage >= totalPages || totalPages === 0;
  });

  readonly packetOptionsWithFallback = computed(() => {
    const options = [...(this.packetOptions() || [])];
    const defaultPacket = this.defaultPacket();

    if (defaultPacket && !options.some(opt =>
      this.serializePacketId(opt.id) === this.serializePacketId(defaultPacket.id)
    )) {
      return [defaultPacket, ...options];
    }

    return options;
  });

  // ========================================
  // 🔗 ViewChild & Cleanup
  // ========================================
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private documentClickUnlisten?: () => void;

  ngAfterViewInit() {
    // Listen for page changes (includes page size changes)
    if (this.paginator) {
      this.paginator.page.subscribe((event: PageEvent) => {
        if (event.pageSize && event.pageSize !== this.pageSize()) {
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
          this.openDropdownRowIndex.set(null);
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

  isRowSelected(row: any): boolean {
    const rowId = this.getRowIdentity(row);
    return this.selectedRows().some(
      (selectedRow) => this.getRowIdentity(selectedRow) === rowId
    );
  }

  isAllSelected(): boolean {
    const data = this.data();
    return data.length > 0 && data.every((row) => this.isRowSelected(row));
  }

  getRowIndex(index: number): number {
    // Calculate the actual row number in the dataset
    // currentPage is 1-based, so we need to subtract 1 to get 0-based page index
    return (this.currentPage() - 1) * this.pageSize() + index + 1;
  }

  onRowSelectionChange(row: any, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.rowSelectionChange.emit({ row, selected: target?.checked || false });
  }

  onRowClick(row: any, event: Event): void {
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

  onSelectAllChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.selectAllChange.emit(target?.checked || false);
  }

  private getRowIdentity(row: any): any {
    if (!row || typeof row !== 'object') {
      return row;
    }

    const key = this.rowIdentityKey();
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

  onPageChange(event: any): void {
    // Prevent pagination if no data
    if (this.totalCount() === 0) {
      return;
    }

    // Prevent duplicate events
    if (
      this.lastEmittedPageIndex() === event.pageIndex &&
      this.lastEmittedPageSize() === (event.pageSize || this.pageSize())
    ) {
      return;
    }

    // Check if page size changed and emit pageSizeChange event
    if (event.pageSize && event.pageSize !== this.pageSize()) {
      this.pageSizeChange.emit(event.pageSize);
      this.lastEmittedPageIndex.set(event.pageIndex);
      this.lastEmittedPageSize.set(event.pageSize);
      // Don't emit pageChange if only pageSize changed
      return;
    }

    // Update tracking
    this.lastEmittedPageIndex.set(event.pageIndex);
    this.lastEmittedPageSize.set(this.pageSize());

    // Emit the page change event to parent component
    // The parent will handle updating currentPage
    this.pageChange.emit(event);
  }

  onPageSizeChange(event: any): void {
    // Handle page size change
    const newPageSize = event.pageSize || event;
    this.pageSizeChange.emit(newPageSize);
  }

  onDragStartRow(row: any, event: DragEvent): void {
    // Allow dragging any row
    const selectedRows = this.selectedRows();
    const ids: string[] =
      Array.isArray(selectedRows) && selectedRows.length > 0
        ? selectedRows.map((r) => r?.id).filter(Boolean)
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

  onAssignToAccountant(row: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.assignToAccountant.emit(row);
  }

  toggleDropdown(rowIndex: number, event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    const wasOpen = this.openDropdownRowIndex() === rowIndex;
    this.openDropdownRowIndex.set(wasOpen ? null : rowIndex);

    // Position the dropdown with fixed coordinates to avoid overflow clipping
    if (!wasOpen) {
      const target = event.currentTarget as HTMLElement;
      if (target) {
        const rect = target.getBoundingClientRect();
        // Place menu below the button - use getBoundingClientRect which gives viewport coordinates
        this.dropdownPosition.set({
          top: rect.bottom + 4,
          left: rect.right - 160, // 160px ~ menu width
        });
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
    const actionLabels = this.actionLabels();
    return (
      actionLabels[action as keyof typeof actionLabels] ||
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
    const actionTitles = this.actionTitles();
    return (
      actionTitles[action as keyof typeof actionTitles] ||
      defaultTitles[action] ||
      ''
    );
  }

  // Get lead status options with current value included
  getLeadStatusOptionsWithCurrent(row: any): string[] {
    const currentStatus = row._draftLeadStatus || row.leadStatus;
    const leadStatusOptions = this.leadStatusOptions();
    if (!currentStatus) return leadStatusOptions;

    // Check if current status is already in options
    const isInOptions = leadStatusOptions.some(
      (opt) => opt.toLowerCase() === currentStatus.toLowerCase()
    );

    // If not in options, add it to the beginning
    if (!isInOptions) {
      return [currentStatus, ...leadStatusOptions];
    }

    return leadStatusOptions;
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
    if (this.alwaysEditLeadStatus()) {
      return true;
    }
    return this.editingLeadId() === row.id;
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
  }

  onCancelLeadStatus(row: any): void {
    this.cancelLeadStatus.emit(row);
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
    const options = this.packetOptionsWithFallback().slice();
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
    const packetOptions = this.packetOptions();
    const defaultPacket = this.defaultPacket();
    const packet =
      packetOptions.find(
        (opt) => this.serializePacketId(opt.id) === selectedValue
      ) ||
      defaultPacket ||
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

  onEmployeeSalesChange(row: any, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedValue = select.value;
    this.employeeSalesChange.emit({
      row,
      employeeSales: selectedValue,
    });
  }
}