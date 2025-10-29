import { Component, ElementRef, OnInit } from '@angular/core';
import {
  DistributionService,
  GetAllLeadsResponse,
} from './distribution.service';
import { NotifyDialogService } from '../../../shared/notify-dialog-host/notify-dialog.service';
import { BreadcrumbItem } from '../../../shared/interfaces/breadcrumb-item.interface';
import { ActionButton } from '../../../shared/interfaces/action-button.interface';
import { ITeleSalse } from '../../../core/Models/employee/itele-salse';
import { ILeadDistribution } from '../../../core/Models/leads/ilead-distribution';

interface Employee {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  assignedCount?: number;
}

interface CustomerItem {
  id: string;
  name: string;
  group?: string;
}

@Component({
  selector: 'app-distribution',
  templateUrl: './distribution.component.html',
  styleUrls: ['./distribution.component.css'],
})
export class DistributionComponent implements OnInit {
  teleSalseList: ITeleSalse[] = [];
  leadsList: ILeadDistribution[] = [];
  stats: any[] = [];
  selectedRows: any[] = [];
  pageSize = 10;
  currentPage = 1;
  totalCount = 0;
  pageTitle = 'إدارة التوزيع';
  searchTerm: string = '';
  selectedClient: string = '';
  assignmentFilter: string = 'جميع العملاء'; // Track assignment filter

  // Transform teleSalseList to dropdown options format (array of strings)
  get employeeOptions() {
    return this.teleSalseList.map((employee) => employee.name);
  }

  constructor(
    private hostEl: ElementRef<HTMLElement>,
    private distributionService: DistributionService,
    private notify: NotifyDialogService,
    private _distributionService: DistributionService
  ) {}

  ngOnInit(): void {
    this.getAllTeleSalse();
    this.getAllLeads();
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    // Reset to first page when searching
    this.currentPage = 1;
    this.getAllLeads();
  }

  onEmployeeSelected(selectedName: string) {
    this.selectedClient = selectedName;
    // Find the full employee object
    this.selectedEmployee =
      this.teleSalseList.find((emp) => emp.name === selectedName) || null;
  }

  /** Breadcrumb items */
  breadcrumb: BreadcrumbItem[] = [
    { label: 'الرئيسية' },
    { label: 'الاتفاقيات', active: true },
  ];

  /** Action Buttons */
  actionButtons: ActionButton[] = [
    {
      label: 'انشاء عميل',
      iconClass: 'bi bi-plus',
      click: () => this.onAddAgreement(),
    },
    {
      iconClass: 'bi bi-box-arrow-in-up',
      click: () => this.onUpload(),
      tooltip: 'Upload',
    },
    {
      iconClass: 'bi bi-box-arrow-right',
      click: () => this.onDownload(),
      tooltip: 'Download',
    },
  ];

  //==================================== get all teleSalse ===========================================
  getAllTeleSalse() {
    this._distributionService.getAllTeleSalse().subscribe({
      next: (response) => {
        this.teleSalseList = response.data || [];
      },
      error: (error) => {
        console.error('getAllTeleSalse failed', error);
        this.notify.open({
          type: 'error',
          title: 'فشل تحميل الموظفين',
          description: 'حدث خطأ أثناء تحميل الموظفين',
        });
      },
    });
  }

  // ======================================== get all leads =========================================
  getAllLeads() {
    // Convert assignment filter to API parameter
    let assignmentParam: boolean | undefined = undefined;
    if (this.assignmentFilter === 'العملاء المخصصين') {
      assignmentParam = true;
    } else if (this.assignmentFilter === 'العملاء غير المخصصين') {
      assignmentParam = false;
    }
    // If 'جميع العملاء', assignmentParam remains undefined

    this._distributionService
      .getAllLeads(
        this.currentPage,
        this.pageSize,
        this.searchTerm,
        assignmentParam
      )
      .subscribe({
        next: (response: GetAllLeadsResponse) => {
          // Handle the specific API response structure: { succeeded: boolean, data: { totalCount: number, items: array } }
          if (response && response.succeeded && response.data) {
            this.leadsList = response.data.items || [];
            this.totalCount = response.data.totalCount || 0;
          } else {
            // Handle error case or unexpected response
            this.leadsList = [];
            this.totalCount = 0;
            this.notify.open({
              type: 'error',
              title: 'فشل تحميل العملاء',
              description: response?.message || 'حدث خطأ أثناء تحميل العملاء',
            });
          }
        },
        error: (error) => {
          console.error('Error loading leads:', error);
          this.leadsList = [];
          this.totalCount = 0;
          this.notify.open({
            type: 'error',
            title: 'فشل تحميل العملاء',
            description: 'حدث خطأ أثناء تحميل العملاء',
          });
        },
      });
  }

  onDownload() {
    // Handle download
  }
  onUpload() {
    // add your upload logic here
  }
  onAddAgreement() {
    // Handle add agreement
  }

  onClickDistribution() {
    // Handle distribution click
  }

  /** Action Buttons */ // Sidebar state
  selectedEmployee: ITeleSalse | null = null;

  groupsList: CustomerItem[] = [
    { id: 'g-1', name: 'مجموعة x' },
    { id: 'g-2', name: 'مجموعة y' },
    { id: 'g-3', name: 'مجموعة z' },
  ];

  assignedCustomers: CustomerItem[] = [];

  availableCustomers: CustomerItem[] = [
    { id: 'c-11', name: 'شركة التقنية المتقدمة' },
    { id: 'c-12', name: 'مؤسسة البناء الحديث' },
    { id: 'c-13', name: 'شركة الخدمات المالية' },
  ];

  isLoading = false;
  isDragOver = false;
  isSidebarCollapsed = false;

  companyColumns = [
    { key: 'dragHandle', header: '', width: '50px' },
    { key: 'name', header: 'الاسم' },
    { key: 'phone', header: 'رقم الهاتف' },
    { key: 'companyName', header: 'اسم الشركة' },
    { key: 'leadStatusName', header: 'حالة العميل' },
    { key: 'campaignName', header: 'اسم الحملة' },
    { key: 'leadSourceName', header: 'مصدر العميل' },
    { key: 'createdAt', header: 'تاريخ الإنشاء' },
    { key: 'actions', header: 'الإجراءات' },
  ];

  companyData: any[] = [];

  onItemAssign(item: CustomerItem) {
    // Validation: Check if employee is selected
    if (!this.selectedEmployee) {
      this.notify.open({
        type: 'error',
        title: 'تحذير',
        description: 'يرجى اختيار موظف أولاً قبل التخصيص',
        autoCloseMs: 3000,
      });
      return;
    }

    // Validation: Check if item is already assigned
    if (this.assignedCustomers.find((c) => c.id === item.id)) {
      this.notify.open({
        type: 'error',
        title: 'معلومة',
        description: 'هذا العنصر مُخصص بالفعل',
        autoCloseMs: 2000,
      });
      return;
    }

    // Validation: Check if employee has reached maximum assignments (optional)
    const maxAssignments = 50; // You can make this configurable
    if (this.assignedCustomers.length >= maxAssignments) {
      this.notify.open({
        type: 'error',
        title: 'حد التخصيص',
        description: `لا يمكن تخصيص أكثر من ${maxAssignments} عنصر للموظف الواحد`,
        autoCloseMs: 3000,
      });
      return;
    }

    // If all validations pass, assign the item silently
    this.assignedCustomers = [...this.assignedCustomers, item];
    this.availableCustomers = this.availableCustomers.filter(
      (c) => c.id !== item.id
    );
    // No success message here - only show when confirming assignment
  }

  onItemUnassign(item: CustomerItem) {
    // Remove from assigned customers
    this.assignedCustomers = this.assignedCustomers.filter(
      (c) => c.id !== item.id
    );

    // Add back to available customers if not already there
    if (!this.availableCustomers.find((c) => c.id === item.id)) {
      this.availableCustomers = [item, ...this.availableCustomers];
    }
  }

  onGroupUnassign(item: CustomerItem) {
    // For groups list - just remove from the list without employee check
    this.groupsList = this.groupsList.filter((g) => g.id !== item.id);
  }

  onConfirmAssignment() {
    // Validation: Check if employee is selected
    if (!this.selectedEmployee || !this.selectedEmployee.id) {
      this.notify.open({
        type: 'error',
        title: 'تحذير',
        description: 'يرجى اختيار موظف أولاً قبل تأكيد التخصيص',
        autoCloseMs: 3000,
      });
      return;
    }

    // Validation: Check if there are any assigned customers
    if (!this.assignedCustomers || this.assignedCustomers.length === 0) {
      this.notify.open({
        type: 'error',
        title: 'تحذير',
        description: 'لا توجد عناصر مخصصة للتأكيد',
        autoCloseMs: 3000,
      });
      return;
    }

    // Validation: Check if all assigned customers have valid IDs
    const invalidCustomers = this.assignedCustomers.filter(
      (c) => !c.id || isNaN(parseInt(c.id))
    );
    if (invalidCustomers.length > 0) {
      this.notify.open({
        type: 'error',
        title: 'خطأ في البيانات',
        description: 'بعض العناصر المخصصة تحتوي على معرفات غير صحيحة',
        autoCloseMs: 3000,
      });
      return;
    }

    // Validation: Check if employee ID is valid
    if (isNaN(this.selectedEmployee.id!)) {
      this.notify.open({
        type: 'error',
        title: 'خطأ في البيانات',
        description: 'معرف الموظف غير صحيح',
        autoCloseMs: 3000,
      });
      return;
    }

    // Show confirmation dialog before proceeding
    const confirmMessage = `هل أنت متأكد من تخصيص ${this.assignedCustomers.length} عنصر للموظف ${this.selectedEmployee.name}؟`;

    // For now, we'll proceed directly, but you can add a confirmation dialog here
    this.proceedWithAssignment();
  }

  private proceedWithAssignment() {
    const selectedEmployee = this.selectedEmployee!;
    const payload = this.assignedCustomers.map((c) => ({
      leadId: parseInt(c.id),
      teleSalesId: selectedEmployee.id!,
      assignedBy: 'string', // You may want to get this from current user
      assignedAt: new Date().toISOString(),
      notes: 'string', // You may want to get this from user input
    }));

    this.isLoading = true;
    this.distributionService.assignGroups(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.assignedCustomers = []; // Reset assigned customers
        this.selectedRows = []; // Clear selected rows

        // Update the table after successful assignment
        this.getAllLeads();

        this.notify.open({
          type: 'success',
          title: 'تم التخصيص',
          description: `تم تخصيص ${payload.length} عنصر للموظف ${selectedEmployee.name} بنجاح`,
          autoCloseMs: 3000,
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Assignment error:', err);
        this.notify.open({
          type: 'error',
          title: 'فشل التخصيص',
          description:
            err?.error?.message ||
            err?.message ||
            'حدث خطأ أثناء تنفيذ عملية التخصيص',
        });
      },
    });
  }

  onDragStart(event: DragEvent, item: CustomerItem) {
    event.dataTransfer?.setData('text/plain', item.id);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;

    // Validation: Check if employee is selected
    if (!this.selectedEmployee) {
      this.notify.open({
        type: 'error',
        title: 'تحذير',
        description: 'يرجى اختيار موظف أولاً قبل سحب العناصر للتخصيص',
        autoCloseMs: 3000,
      });
      return;
    }

    // Prefer JSON array payload for multi-drag
    const json = event.dataTransfer?.getData('application/json');
    const text = event.dataTransfer?.getData('text/plain');
    let ids: string[] = [];
    try {
      if (json) ids = JSON.parse(json);
    } catch {
      // ignore
    }
    if (!ids || ids.length === 0) {
      if (text) ids = [text];
      else {
        this.notify.open({
          type: 'error',
          title: 'تحذير',
          description: 'لم يتم العثور على عناصر صالحة للسحب',
          autoCloseMs: 2000,
        });
        return;
      }
    }

    const toAssignBatch: CustomerItem[] = [];
    const alreadyAssigned: string[] = [];
    const maxAssignments = 50; // Same limit as individual assignment

    // Validation: Check if adding these items would exceed the limit
    if (this.assignedCustomers.length + ids.length > maxAssignments) {
      this.notify.open({
        type: 'error',
        title: 'حد التخصيص',
        description: `لا يمكن تخصيص أكثر من ${maxAssignments} عنصر للموظف الواحد`,
        autoCloseMs: 3000,
      });
      return;
    }

    ids.forEach((id) => {
      const row = this.leadsList.find((r) => r.id.toString() === id.toString());
      if (row) {
        const candidate: CustomerItem = {
          id: row.id.toString(),
          name: row.name,
        };
        if (!this.assignedCustomers.find((c) => c.id === candidate.id)) {
          toAssignBatch.push(candidate);
        } else {
          alreadyAssigned.push(candidate.name);
        }
        return;
      }
      const item = this.availableCustomers.find((c) => c.id === id);
      if (item && !this.assignedCustomers.find((c) => c.id === item.id)) {
        toAssignBatch.push(item);
      } else if (item) {
        alreadyAssigned.push(item.name);
      }
    });

    // Show warnings for already assigned items
    if (alreadyAssigned.length > 0) {
      this.notify.open({
        type: 'error',
        title: 'معلومة',
        description: `العناصر التالية مُخصصة بالفعل: ${alreadyAssigned.join(
          ', '
        )}`,
        autoCloseMs: 3000,
      });
    }

    // Assign new items silently (no success message)
    if (toAssignBatch.length > 0) {
      this.assignedCustomers = [...this.assignedCustomers, ...toAssignBatch];
      // No success message here - only show when confirming assignment
    }
  }

  // Custom dropdowns (filter bar)
  filterDropdowns: Array<{
    key: string;
    label: string;
    options: string[];
    selected?: string | null;
    open: boolean;
  }> = [
    {
      key: 'assignment',
      label: 'حالة التخصيص',
      options: ['جميع العملاء', 'العملاء المخصصين', 'العملاء غير المخصصين'],
      selected: 'جميع العملاء',
      open: false,
    },
    {
      key: 'group',
      label: 'اختر المجموعة',
      options: ['المجموعة 1', 'المجموعة 2', 'المجموعة 3'],
      selected: null,
      open: false,
    },

    {
      key: 'role',
      label: 'اختر المنصب',
      options: ['مطور', 'مصمم', 'مدير'],
      selected: null,
      open: false,
    },
    {
      key: 'status',
      label: 'اختر الحالة',
      options: ['نشط', 'معلق', 'مغلق'],
      selected: null,
      open: false,
    },
    {
      key: 'type',
      label: 'اختر النوع',
      options: ['مؤسسة', 'شركة', 'فرد'],
      selected: null,
      open: false,
    },
    {
      key: 'region',
      label: 'اختر المنطقة',
      options: ['الرياض', 'جدة', 'الشرقية'],
      selected: null,
      open: false,
    },
    {
      key: 'owner',
      label: 'اختر المالك',
      options: ['أحمد', 'محمد', 'خالد'],
      selected: null,
      open: false,
    },
  ];

  toggleDropdown(dd: { open: boolean }): void {
    // close other dropdowns
    this.filterDropdowns.forEach((d) => {
      if (d !== dd) d.open = false;
    });
    dd.open = !dd.open;
  }

  selectOption(
    dd: { selected?: string | null; open: boolean; key: string },
    option: string
  ): void {
    dd.selected = option;
    dd.open = false;

    // Handle assignment filter
    if (dd.key === 'assignment') {
      this.assignmentFilter = option;
      this.currentPage = 1; // Reset to first page
      this.getAllLeads(); // Reload data with new filter
    }
  }

  private clickIsInsideCustomDropdown(target: HTMLElement): boolean {
    let el: HTMLElement | null = target;
    while (el && el !== this.hostEl.nativeElement) {
      if (el.classList && el.classList.contains('custom-dropdown')) return true;
      el = el.parentElement;
    }
    return false;
  }

  onRowSelectionChange(event: { row: any; selected: boolean }): void {
    if (event.selected) {
      // Check if row is not already selected
      if (!this.selectedRows.find((row) => row.id === event.row.id)) {
        this.selectedRows.push(event.row);
      }
    } else {
      this.selectedRows = this.selectedRows.filter(
        (row) => row.id !== event.row.id
      );
    }
  }

  onSelectAllChange(selectAll: boolean): void {
    if (selectAll) {
      // Only select rows that aren't already selected
      const newSelections = this.leadsList.filter(
        (row) =>
          !this.selectedRows.some((selectedRow) => selectedRow.id === row.id)
      );
      this.selectedRows = [...this.selectedRows, ...newSelections];
    } else {
      this.selectedRows = [];
    }
  }

  onEditDeal(deal: any): void {
    // Add your edit logic here
  }

  onDeleteDeal(deal: any): void {
    // Add your delete logic here
  }

  onViewDeal(deal: any): void {
    // Add your view logic here
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  // Pagination methods
  onPageChange(event: any): void {
    // Prevent pagination if no data
    if (this.totalCount === 0) {
      return;
    }

    // Convert from 0-based paginator to 1-based API
    const newPage = event.pageIndex + 1;
    this.currentPage = newPage;
    this.getAllLeads();
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1; // Reset to first page
    this.getAllLeads();
  }
}
