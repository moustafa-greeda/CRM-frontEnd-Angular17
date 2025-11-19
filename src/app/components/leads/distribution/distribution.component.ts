import { Component, OnInit } from '@angular/core';
import {
  DistributionService,
  GetAllLeadsResponse,
} from './distribution.service';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';
import { BreadcrumbItem } from '../../../shared/interfaces/breadcrumb-item.interface';
import { ActionButton } from '../../../shared/interfaces/action-button.interface';
import { ITeleSalse } from '../../../core/Models/employee/itele-salse';
import { ILeadDistribution } from '../../../core/Models/leads/ilead-distribution';

/*---------------------------- Interfaces --------------*/
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
  /*---------------------------- Properties --------------*/
  teleSalseList: ITeleSalse[] = [];
  leadsList: ILeadDistribution[] = [];
  selectedRows: any[] = [];
  pageSize = 10;
  currentPage = 1;
  totalCount: number = 0;
  pageTitle = 'إدارة التوزيع';
  searchTerm: string = '';
  selectedClient: string = '';
  assignmentFilter: string = 'جميع العملاء';
  selectedEmployee: ITeleSalse | null = null;
  assignedCustomers: CustomerItem[] = [];
  availableCustomers: CustomerItem[] = [];
  isLoading = false;
  isDragOver = false;
  isSidebarCollapsed = false;

  /*---------------------------- Getters --------------*/
  get employeeOptions() {
    return this.teleSalseList.map((employee) => employee.name);
  }

  /*---------------------------- Constructor --------------*/
  constructor(
    private _distributionService: DistributionService,
    private notify: NotifyDialogService
  ) {}

  /*---------------------------- Lifecycle Hooks --------------*/
  ngOnInit(): void {
    this.getAllTeleSalse();
    this.getAllLeads();
  }

  /*---------------------------- UI Data Configuration --------------*/
  breadcrumb: BreadcrumbItem[] = [
    { label: 'الرئيسية' },
    { label: 'الاتفاقيات', active: true },
  ];

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

  companyColumns = [
    { key: 'dragHandle', header: '', width: '50px' },
    { key: 'name', header: 'الاسم' },
    { key: 'phone', header: 'رقم الهاتف' },
    { key: 'companyName', header: 'اسم الشركة' },
    { key: 'leadStatusName', header: 'حالة العميل' },
    { key: 'campaignName', header: 'اسم الحملة' },
    { key: 'leadSourceName', header: 'مصدر العميل' },
    { key: 'assignedTo', header: 'مخصص ل' },
    { key: 'createdAt', header: 'تاريخ الإنشاء' },
    { key: 'actions', header: 'الإجراءات' },
  ];

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

  /*---------------------------- Event Handlers --------------*/
  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.currentPage = 1;
    this.getAllLeads();
  }

  onEmployeeSelected(selectedName: string) {
    this.selectedClient = selectedName;
    this.selectedEmployee =
      this.teleSalseList.find((emp) => emp.name === selectedName) || null;
  }

  /*---------------------------- API Methods --------------*/
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

  getAllLeads() {
    let assignmentParam: boolean | undefined = undefined;
    if (this.assignmentFilter === 'العملاء المخصصين') {
      assignmentParam = true;
    } else if (this.assignmentFilter === 'العملاء غير المخصصين') {
      assignmentParam = false;
    }

    this._distributionService
      .getAllLeads(
        this.currentPage,
        this.pageSize,
        this.searchTerm,
        assignmentParam
      )
      .subscribe({
        next: (response: GetAllLeadsResponse) => {
          if (response && response.succeeded && response.data) {
            this.leadsList = response.data.items || [];
            this.totalCount = response.data.totalCount || 0;
          } else {
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

  /*---------------------------- Action Button Handlers --------------*/
  onDownload() {
    // Handle download
  }

  onUpload() {
    // Handle upload logic
  }

  onAddAgreement() {
    // Handle add agreement
  }

  /*---------------------------- Customer Assignment Methods --------------*/
  onItemUnassign(item: CustomerItem) {
    this.assignedCustomers = this.assignedCustomers.filter(
      (c) => c.id !== item.id
    );

    if (!this.availableCustomers.find((c) => c.id === item.id)) {
      this.availableCustomers = [item, ...this.availableCustomers];
    }
  }

  onConfirmAssignment() {
    if (!this.selectedEmployee || !this.selectedEmployee.id) {
      this.notify.open({
        type: 'error',
        title: 'تحذير',
        description: 'يرجى اختيار موظف أولاً قبل تأكيد التخصيص',
        autoCloseMs: 3000,
      });
      return;
    }

    if (!this.assignedCustomers || this.assignedCustomers.length === 0) {
      this.notify.open({
        type: 'error',
        title: 'تحذير',
        description: 'لا توجد عناصر مخصصة للتأكيد',
        autoCloseMs: 3000,
      });
      return;
    }

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

    if (isNaN(this.selectedEmployee.id!)) {
      this.notify.open({
        type: 'error',
        title: 'خطأ في البيانات',
        description: 'معرف الموظف غير صحيح',
        autoCloseMs: 3000,
      });
      return;
    }

    this.proceedWithAssignment();
  }

  private proceedWithAssignment() {
    const selectedEmployee = this.selectedEmployee!;
    const payload = this.assignedCustomers.map((c) => ({
      leadId: parseInt(c.id),
      teleSalesId: selectedEmployee.id!,
      assignedBy: 'string',
      assignedAt: new Date().toISOString(),
      notes: 'string',
    }));

    this.isLoading = true;
    this._distributionService.assignGroups(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.assignedCustomers = [];
        this.selectedRows = [];
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

  /*---------------------------- Drag and Drop Methods --------------*/
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

    if (!this.selectedEmployee) {
      this.notify.open({
        type: 'error',
        title: 'تحذير',
        description: 'يرجى اختيار موظف أولاً قبل سحب العناصر للتخصيص',
        autoCloseMs: 3000,
      });
      return;
    }

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
    const maxAssignments = 50;

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

    if (toAssignBatch.length > 0) {
      this.assignedCustomers = [...this.assignedCustomers, ...toAssignBatch];
    }
  }

  /*---------------------------- Filter Dropdown Methods --------------*/
  toggleDropdown(dd: { open: boolean }): void {
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

    if (dd.key === 'assignment') {
      this.assignmentFilter = option;
      this.currentPage = 1;
      this.getAllLeads();
    }
  }

  /*---------------------------- Table Row Selection Methods --------------*/
  onRowSelectionChange(event: { row: any; selected: boolean }): void {
    if (event.selected) {
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
      const newSelections = this.leadsList.filter(
        (row) =>
          !this.selectedRows.some((selectedRow) => selectedRow.id === row.id)
      );
      this.selectedRows = [...this.selectedRows, ...newSelections];
    } else {
      this.selectedRows = [];
    }
  }

  /*---------------------------- Table Action Handlers --------------*/
  onEditDeal(deal: any): void {
    // Handle edit logic
  }

  onDeleteDeal(deal: any): void {
    // Handle delete logic
  }

  onViewDeal(deal: any): void {
    // Handle view logic
  }

  /*---------------------------- Sidebar Methods --------------*/
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  /*---------------------------- Pagination Methods --------------*/
  onPageChange(event: any): void {
    if (this.totalCount === 0) {
      return;
    }

    const newPage = event.pageIndex + 1;
    this.currentPage = newPage;
    this.getAllLeads();
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.getAllLeads();
  }
}
