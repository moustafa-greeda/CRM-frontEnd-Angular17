import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ActionButton } from '../../../shared/interfaces/action-button.interface';
import { BreadcrumbItem } from '../../../shared/interfaces/breadcrumb-item.interface';
import { NgxSpinnerService } from 'ngx-spinner';
import { DateUtilsService } from '../../../core/services/common/date-utils.service';
import { EmployeeDataService } from './services/employee-data.service';
import { EmployeeFormHandler } from './services/employee-form.handler';
import { EmployeeCrudService } from './services/employee-crud.service';
import {
  IGetAllEmployee,
  EmployeeFormData,
  EmployeeFilters,
} from '../../../core/Models/employee/iemployee';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { GridCardsComponent } from '../../../shared/ui/grid-cards/grid-cards.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { NoResultsMessageComponent } from '../../../shared/components/no-results-message/no-results-message.component';

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    DropdownComponent,
    SearchInputComponent,
    GridCardsComponent,
    CardComponent,
    NoResultsMessageComponent,
  ],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
  // ⚡ تحسين الأداء - Change Detection على الـ Signals فقط
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeeComponent implements OnInit {
  // UI State
  readonly pageTitle = 'إدارة الموظفين';
  readonly breadcrumb: BreadcrumbItem[] = [
    { label: 'الرئيسية' },
    { label: 'الموظفين', active: true },
  ];
  readonly searchPlaceholder = 'ابحث عن الموظف بالاسم أو الكود';
  readonly statusOptions: string[] = ['نشط', 'غير نشط'];

  // ========== البيانات ==========
  employeeList = signal<IGetAllEmployee[]>([]);

  // ========== الفلاتر ==========
  lastSearchTerm = signal<string>('');
  selectedStatus = signal<string>('');
  selectedDepartment = signal<string>('');

  // ⚡ Loading state
  private _isLoadingEmployees = signal<boolean>(false);
  isInitialLoad = signal<boolean>(true);
  isLoadingFormData = signal<boolean>(true);

  // ========== Computed Signals ==========
  readonly hasActiveSearchTerm = computed(() => {
    const term = this.lastSearchTerm();
    return !!term && term.trim().length > 0;
  });

  readonly hasActiveSearch = computed(() => {
    return (
      !!this.lastSearchTerm() ||
      !!this.selectedStatus() ||
      !!this.selectedDepartment()
    );
  });

  readonly hasNoEmployees = computed(
    () => this.isInitialLoad() === false && this.employeeList().length === 0
  );

  readonly isLoadingEmployees = computed(
    () => this.isInitialLoad() && this._isLoadingEmployees()
  );

  readonly departmentOptions = this.dataService.departmentOptions;

  actionButtons: ActionButton[] = [
    {
      label: 'إضافة موظف',
      iconClass: 'bi bi-plus',
      click: () => this.onAddEmployee(),
    },
  ];

  constructor(
    private dataService: EmployeeDataService,
    private formHandler: EmployeeFormHandler,
    private crudService: EmployeeCrudService,
    private spinner: NgxSpinnerService,
    private dateUtils: DateUtilsService
  ) {}

  ngOnInit(): void {
    this.loadAllInitialData();
    this.loadEmployees();
  }

  // ==========================================================
  // 📥 تحميل البيانات
  // ==========================================================
  loadEmployees(): void {
    // ✅ Prevent duplicate API calls if already loading
    if (this._isLoadingEmployees()) {
      return;
    }

    this._isLoadingEmployees.set(true);
    this.spinner.show();

    const filters = this.buildFilters();

    this.dataService.loadEmployees(filters).subscribe({
      next: (response) => {
        this.employeeList.set(response.employees);
        this._isLoadingEmployees.set(false);
        this.spinner.hide();

        if (this.isInitialLoad()) {
          this.isInitialLoad.set(false);
        }
      },
      error: (error) => {
        console.error('Error fetching employees:', error);
        this.handleGetEmployeesError(error);
      },
    });
  }

  loadAllInitialData(): void {
    this.spinner.show();

    this.dataService.loadAllInitialData().subscribe({
      next: (data) => {
        this.isLoadingFormData.set(false);
        this.spinner.hide();
      },
      error: () => {
        this.isLoadingFormData.set(false);
        this.spinner.hide();
      },
    });
  }

  /**
   * Handles errors when fetching employees
   */
  private handleGetEmployeesError(error: any): void {
    this._isLoadingEmployees.set(false);
    this.spinner.hide();

    if (this.hasActiveSearchTerm()) {
      this.employeeList.set([]);
    } else {
      // Error notification can be shown here if needed
      this.employeeList.set([]);
    }

    if (this.isInitialLoad()) {
      this.isInitialLoad.set(false);
    }
  }

  /**
   * Builds filter object from search criteria
   */
  private buildFilters(): EmployeeFilters {
    const filters: EmployeeFilters = {};

    const searchTerm = this.lastSearchTerm();
    if (searchTerm && searchTerm.trim()) {
      const searchValue = searchTerm.trim();
      // Check if it looks like a code (starts with letter and has numbers)
      if (/^[A-Za-z]\d+/.test(searchValue)) {
        filters.empCode = searchValue;
      } else {
        filters.empName = searchValue;
      }
    }

    const status = this.selectedStatus();
    if (status) {
      if (status === 'نشط') {
        filters.isActive = true;
      } else if (status === 'غير نشط') {
        filters.isActive = false;
      }
    }

    const department = this.selectedDepartment();
    if (department) {
      const departments = this.dataService.getCurrentDepartments();
      const dept = departments.find((d) => d.name === department);
      if (dept) {
        filters.departmentId = dept.id;
      }
    }

    return filters;
  }

  // ==========================================================
  // 🔍 البحث والفلترة
  // ==========================================================
  onSearch(searchTerm: string): void {
    this.lastSearchTerm.set(searchTerm || '');
    this.loadEmployees();
  }

  onStatusMethodChange(status: string): void {
    this.selectedStatus.set(status);
    this.loadEmployees();
  }

  onDepartmentChange(department: string): void {
    this.selectedDepartment.set(department);
    this.loadEmployees();
  }

  resetFilters(): void {
    this.lastSearchTerm.set('');
    this.selectedStatus.set('');
    this.selectedDepartment.set('');
    this.loadEmployees();
  }

  // ==========================================================
  // CRUD Operations
  // ==========================================================
  onAddEmployee(): void {
    if (this.isLoadingFormData()) return;

    const departments = this.dataService.getCurrentDepartments();
    const users = this.dataService.getCurrentUsers();

    const hasAllOptions = departments.length > 0;

    if (!hasAllOptions) return;

    const dialogRef = this.formHandler.openForm(
      null,
      {
        departments,
        users,
      },
      {
        onGenerateEmpCode: (departmentId) => {
          const componentInstance = dialogRef.componentInstance;
          // Use requestAnimationFrame for smoother updates without reload
          requestAnimationFrame(() => {
            const form = componentInstance.form;
            if (form && form.get('empCode')) {
              this.formHandler.generateEmployeeCode(
                departmentId,
                form,
                componentInstance
              );
            }
          });
        },
        onSubmit: (formData, isEdit, employeeId) => {
          if (isEdit && employeeId) {
            this.crudService.updateEmployee(
              employeeId,
              formData,
              (employee) => {
                // Enrich with department name
                const enriched =
                  this.dataService.enrichEmployeeWithDepartment(employee);
                // Update the list
                const currentList = this.employeeList();
                const updatedList = currentList.map((emp) =>
                  emp.id === employeeId ? enriched : emp
                );
                this.employeeList.set(updatedList);
              },
              () => dialogRef.close()
            );
          } else {
            this.crudService.createEmployee(
              formData,
              (employee) => {
                // Enrich with department name
                const enriched =
                  this.dataService.enrichEmployeeWithDepartment(employee);
                // Add to the list
                this.employeeList.set([enriched, ...this.employeeList()]);
              },
              () => dialogRef.close()
            );
          }
        },
      }
    );
  }

  onEditEmployee(employee: IGetAllEmployee): void {
    if (this.isLoadingFormData()) return;

    const departments = this.dataService.getCurrentDepartments();
    const users = this.dataService.getCurrentUsers();

    const hasAllOptions = departments.length > 0;

    if (!hasAllOptions) return;

    const dialogRef = this.formHandler.openForm(
      employee,
      {
        departments,
        users,
      },
      {
        onGenerateEmpCode: (departmentId) => {
          const componentInstance = dialogRef.componentInstance;
          // Use requestAnimationFrame for smoother updates without reload
          requestAnimationFrame(() => {
            const form = componentInstance.form;
            if (form && form.get('empCode')) {
              this.formHandler.generateEmployeeCode(
                departmentId,
                form,
                componentInstance
              );
            }
          });
        },
        onSubmit: (formData, isEdit, employeeId) => {
          if (employeeId) {
            this.crudService.updateEmployee(
              employeeId,
              formData,
              (employee) => {
                // Enrich with department name
                const enriched =
                  this.dataService.enrichEmployeeWithDepartment(employee);
                // Update the list
                const currentList = this.employeeList();
                const updatedList = currentList.map((emp) =>
                  emp.id === employeeId ? enriched : emp
                );
                this.employeeList.set(updatedList);
              },
              () => dialogRef.close()
            );
          }
        },
      }
    );
  }

  // ==========================================================
  // Utility Methods
  // ==========================================================
  /**
   * Format date for display
   */
  formatDate(date: string | Date | null | undefined): string {
    if (!date) return '-';
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return '-';
      return this.dateUtils.formatDate(dateObj);
    } catch (error) {
      return '-';
    }
  }

  /** Build card data object including mapped status field */
  getEmployeeCardData(employee: IGetAllEmployee): Record<string, any> {
    return {
      ...employee,
      status: employee.isActive ? 'active' : 'inactive',
    };
  }

  trackByClientId(index: number, employee: IGetAllEmployee): number {
    return employee.id || index;
  }
}
