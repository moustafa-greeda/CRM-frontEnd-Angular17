import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  EmployeeFilters,
  EmployeeFormData,
  EmployeeFormInitialData,
  IEmployee,
  IGetAllEmployee,
} from '../../../core/Models/employee/iemployee';
import { EmployeeService } from './employee.service';
import { BreadcrumbItem } from '../../../shared/interfaces/breadcrumb-item.interface';
import { ActionButton } from '../../../shared/interfaces/action-button.interface';
import { FormUiComponent } from '../../../shared/components/form-ui/form-ui.component';
import { EMPLOYEE_FORM_CONFIG } from '../../../shared/configs';
import { DepartmentService } from '../../../core/services/common/department.service';
import { IDepartment } from '../../../core/Models/common/idepartment';
import { AllUsersService } from '../../../core/services/common/all-users.service';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';
import { User } from '../../../core/Models/user/user.model';
import { DateUtilsService } from '../../../core/services/common/date-utils.service';

export type EmployeeDialogRef = MatDialogRef<FormUiComponent>;

// =============================== HELPER FUNCTIONS ===============================
/**
 * Normalizes gender value to match form options
 */
function normalizeGender(genderValue: string): string {
  if (!genderValue) return '';

  const genderLower = genderValue.toLowerCase();
  if (genderLower === 'female' || genderLower === 'أنثى') {
    return 'female';
  } else if (genderLower === 'male' || genderLower === 'ذكر') {
    return 'male';
  }
  return genderValue;
}

/**
 * Normalizes position value to match form config options
 */
function normalizePosition(positionValue: string): string {
  if (!positionValue) return '';

  const positionLower = positionValue.toLowerCase();

  if (positionLower.includes('sales') || positionLower.includes('salesman')) {
    return 'sales';
  } else if (
    positionLower.includes('manager') ||
    positionLower.includes('مدير')
  ) {
    return 'manager';
  } else if (
    positionLower.includes('developer') ||
    positionLower.includes('قائد')
  ) {
    return 'developer';
  } else if (
    positionLower.includes('designer') ||
    positionLower.includes('موظف')
  ) {
    return 'designer';
  }
  return positionValue;
}

/**
 * Normalizes empUserId to match form options
 */
function normalizeEmpUserId(
  empUserId: string | number | null | undefined,
  usersList: User[]
): string {
  if (empUserId == null || empUserId === '') {
    return '';
  }

  const empUserIdValue = String(empUserId).trim();

  // Verify the value exists in usersList options
  const userExists = usersList.some((user) => {
    const userIdStr = String(user.id).trim();
    return userIdStr === empUserIdValue;
  });

  if (userExists) {
    return empUserIdValue;
  }

  // Try to find by comparing without type conversion issues
  const foundUser = usersList.find((user) => {
    return (
      String(user.id) === String(empUserId) ||
      user.id === empUserId ||
      String(user.id) === empUserIdValue
    );
  });

  if (foundUser) {
    return String(foundUser.id);
  }

  return '';
}

/**
 * Maps employee data to form initial data structure
 * Accepts both IEmployee and IGetAllEmployee types
 */
function mapEmployeeToFormData(
  employee: IEmployee | IGetAllEmployee,
  departmentsList: IDepartment[],
  usersList: User[]
): EmployeeFormInitialData {
  // Find departmentId from departmentName if departmentId is missing
  let departmentId: number | undefined = (employee as IEmployee).departmentId;
  if (!departmentId && employee.departmentName && departmentsList.length > 0) {
    const department = departmentsList.find(
      (dept) => dept.name === employee.departmentName
    );
    departmentId = department?.id;
  }

  // Normalize gender to lowercase to match form options
  const genderValue = normalizeGender(employee.gender || '');

  // Map position value to match form config options
  const positionValue = normalizePosition(employee.position || '');

  // Handle empUserId - convert to string and ensure it matches options
  const empUserIdValue = normalizeEmpUserId(
    (employee as IEmployee).empUserId,
    usersList
  );

  return {
    name: employee.name || '',
    phoneNumber: employee.phoneNumber || '',
    email: employee.email || '',
    empCode: employee.empCode || '',
    position: positionValue,
    dateOfBirth: employee.dateOfBirth
      ? new Date(employee.dateOfBirth).toISOString().split('T')[0]
      : '',
    hireDate: employee.hireDate
      ? new Date(employee.hireDate).toISOString().split('T')[0]
      : '',
    departmentId: departmentId != null ? String(departmentId) : '',
    salary: employee.salary?.toString() || '',
    gender: genderValue,
    isActive: employee.isActive === true,
    address: employee.address || '',
    empUserId: empUserIdValue,
  };
}

/* Maps form data to employee data structure*/
function mapFormDataToEmployee(
  formData: EmployeeFormData,
  employeeId?: number
): IEmployee {
  return {
    ...(employeeId && { id: employeeId }),
    name: formData.name,
    phoneNumber: formData.phoneNumber,
    email: formData.email,
    empCode: formData.empCode,
    position: formData.position,
    dateOfBirth: formData.dateOfBirth
      ? new Date(formData.dateOfBirth).toISOString()
      : '',
    hireDate: formData.hireDate
      ? new Date(formData.hireDate).toISOString()
      : '',
    departmentId: parseInt(formData.departmentId, 10),
    salary: parseFloat(formData.salary) || 0,
    gender: formData.gender,
    isActive: formData.isActive === 'true' || formData.isActive === true,
    file: formData.file,
    address: formData.address || '',
    empUserId: formData.empUserId || '',
    emprengcyPhone: formData.emprengcyPhone || '',
    emprengcyPhoneContactName: formData.emprengcyPhoneContactName || '',
  };
}

/**
 * Maps department names to employees
 */
function mapDepartmentNamesToEmployees(
  employees: IGetAllEmployee[],
  departmentsList: IDepartment[]
): IGetAllEmployee[] {
  return employees.map((employee) => {
    // Prefer value coming from API if already present
    if (employee.departmentName && employee.departmentName.trim().length > 0) {
      return employee;
    }

    // If departmentId is available, find department by ID
    const department = (employee as any).departmentId
      ? departmentsList.find(
          (dept) => Number(dept.id) === Number((employee as any).departmentId)
        )
      : null;

    return {
      ...employee,
      departmentName: department?.name || employee.departmentName || 'غير محدد',
    } as IGetAllEmployee;
  });
}

/**
 * Enriches employee with department name
 */
function enrichEmployeeWithDepartment(
  employee: IEmployee,
  departmentsList: IDepartment[]
): IGetAllEmployee {
  const deptId = Number(employee.departmentId);
  const department = departmentsList.find((dept) => Number(dept.id) === deptId);

  return {
    id: employee.id,
    name: employee.name,
    isActive: employee.isActive ?? true,
    email: employee.email,
    empCode: employee.empCode,
    phoneNumber: employee.phoneNumber,
    hireDate: employee.hireDate || '',
    salary: employee.salary,
    gender: (employee.gender === 'male' ? 'Male' : 'Female') as
      | 'Male'
      | 'Female',
    dateOfBirth: employee.dateOfBirth || '',
    position: employee.position,
    imagePath: (employee as any).imagePath || null,
    departmentName: department?.name || employee.departmentName || 'غير محدد',
    address: employee.address || '',
    emprengcyPhone: employee.emprengcyPhone || '',
    emprengcyPhoneContactName: employee.emprengcyPhoneContactName || '',
  } as IGetAllEmployee;
}

/**
 * Converts array of IEmployee to IGetAllEmployee[]
 */
function convertEmployeesToGetAll(
  employees: IEmployee[],
  departmentsList: IDepartment[]
): IGetAllEmployee[] {
  return employees.map((employee) =>
    enrichEmployeeWithDepartment(employee, departmentsList)
  );
}

/**
 * Builds filter object from search criteria
 */
function buildEmployeeFilters(
  searchTerm: string,
  selectedStatus: string,
  selectedDepartment: string,
  departmentsList: IDepartment[]
): EmployeeFilters {
  const filters: EmployeeFilters = {};

  // Add search filters
  if (searchTerm && searchTerm.trim()) {
    const searchValue = searchTerm.trim();
    // Check if it looks like a code (starts with letter and has numbers)
    if (/^[A-Za-z]\d+/.test(searchValue)) {
      filters.empCode = searchValue;
    } else {
      filters.empName = searchValue;
    }
  }

  // Add status filter
  if (selectedStatus) {
    if (selectedStatus === 'نشط') {
      filters.isActive = true;
    } else if (selectedStatus === 'غير نشط') {
      filters.isActive = false;
    }
  }

  // Add department filter
  if (selectedDepartment) {
    const department = departmentsList.find(
      (dept) => dept.name === selectedDepartment
    );
    if (department) {
      filters.departmentId = department.id;
    }
  }

  return filters;
}

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.css'],
})
export class EmployeeComponent implements OnInit {
  pageTitle = 'إدارة الموظفين';
  breadcrumb: BreadcrumbItem[] = [
    { label: 'الرئيسية' },
    { label: 'الموظفين', active: true },
  ];
  departmentsList: IDepartment[] = [];
  usersList: User[] = [];

  // Search and filter properties
  searchPlaceholder = 'ابحث عن الموظف بالاسم أو الكود';
  filterForm!: FormGroup;
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedDepartment: string = '';
  statusOptions: string[] = ['نشط', 'غير نشط'];
  departmentOptions: string[] = [];
  hasActiveSearch: boolean = false;
  hasActiveSearchTerm: boolean = false;
  isLoading: boolean = false;
  isCreatingEmployee: boolean = false;

  constructor(
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private _departmentService: DepartmentService,
    private _allUsersService: AllUsersService,
    private notify: NotifyDialogService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private dateUtils: DateUtilsService
  ) {
    this.filterForm = this.fb.group({
      status: [''],
      department: [''],
    });
  }

  employeeFormConfig = { ...EMPLOYEE_FORM_CONFIG };

  /** Action Buttons */
  actionButtons: ActionButton[] = [
    {
      label: 'إضافة موظف',
      iconClass: 'bi bi-plus',
      click: () => this.onAddEmployee(),
    },
  ];
  // Reactive source for list
  employeesList$ = new BehaviorSubject<IGetAllEmployee[]>([]);

  ngOnInit(): void {
    this.getEmployees();
    this.getDepartments();
    this.getAllUsersList();
  }

  // =============================== get employees ===================
  getEmployees(): void {
    const filters = buildEmployeeFilters(
      this.searchTerm,
      this.selectedStatus,
      this.selectedDepartment,
      this.departmentsList
    );

    // Show loader
    this.isLoading = true;
    this.spinner.show();

    this.employeeService.getAllEmployees(filters).subscribe({
      next: (response) => {
        const list = response.data || [];
        const convertedList = convertEmployeesToGetAll(
          list,
          this.departmentsList
        );
        this.employeesList$.next(convertedList);
        this.mapDepartmentNames();
        // Hide loader on success
        this.isLoading = false;
        this.spinner.hide();
      },
      error: (error) => {
        console.error('Error fetching employees:', error);
        this.handleGetEmployeesError(error);
      },
    });
  }

  /**
   * Handles errors when fetching employees
   */
  private handleGetEmployeesError(error: any): void {
    // Hide loader on error
    this.isLoading = false;
    this.spinner.hide();

    // If there's an error and we have an active search, show no results
    if (this.hasActiveSearchTerm) {
      this.employeesList$.next([]);
    } else {
      // If no search, show error notification
      this.notify.error({
        title: 'فشل',
        description: 'لا يوجد موظفين مطابقين للبحث',
      });
    }
  }

  /** Build card data object including mapped status field */
  getEmployeeCardData(employee: IGetAllEmployee): Record<string, any> {
    return {
      ...employee,
      status: employee.isActive ? 'active' : 'inactive',
    };
  }

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

  // =============================== map department names ===================
  private mapDepartmentNames(): void {
    const currentEmployees = this.employeesList$.value || [];
    const updated = mapDepartmentNamesToEmployees(
      currentEmployees,
      this.departmentsList
    );
    this.employeesList$.next(updated);
  }

  trackByClientId(index: number, employee: IGetAllEmployee): number {
    return employee.id || index;
  }

  // Getter to check if employees list is empty
  get hasNoEmployees(): boolean {
    const employees = this.employeesList$.value || [];
    return employees.length === 0;
  }

  // =============================== get departments ===================
  getDepartments(): void {
    this._departmentService.getAllDepartments().subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.departmentsList = response.data || [];

          // Update form configuration with department options
          this.updateDepartmentOptions();

          // Update department options for filter dropdown
          this.departmentOptions = this.departmentsList.map(
            (dept) => dept.name
          );

          // Map department names to existing employees
          this.mapDepartmentNames();
        } else {
          this.departmentsList = [];
        }
      },
      error: (error) => {
        this.departmentsList = [];
      },
    });
  }

  // =============================== get all users ===================
  getAllUsersList(): void {
    this._allUsersService.getAllUsers().subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.usersList = response.data?.items || [];
          // this.updateUserOptions();
        } else {
          this.usersList = [];
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.usersList = [];
      },
    });
  }

  // =============================== update department options ===================
  private updateDepartmentOptions(): void {
    const departmentField = this.employeeFormConfig.fields.find(
      (field) => field.name === 'departmentId'
    );
    if (departmentField && this.departmentsList.length > 0) {
      departmentField.options = this.departmentsList.map((dept) => ({
        value: String(dept.id), // Convert to string to match initialData
        label: dept.name,
      }));
    }
  }

  // =============================== add employee ===================
  onAddEmployee(): void {
    this.updateDepartmentOptions();
    // this.updateUserOptions();

    // Set default value for isActive = true when creating
    const initialData: EmployeeFormInitialData = {
      isActive: true,
    } as EmployeeFormInitialData;

    const dialogRef = this.openEmployeeDialog(
      this.employeeFormConfig,
      initialData
    );

    // Listen to submit event from FormUiComponent and only close on success
    const componentInstance = dialogRef.componentInstance;
    componentInstance.formSubmit.subscribe((formData: EmployeeFormData) => {
      this.createEmployee(formData, dialogRef);
    });

    // Listen to departmentId changes to auto-generate empCode
    this.setupDepartmentChangeListener(componentInstance);

    // Keep afterClosed in case user cancels
    dialogRef.afterClosed().subscribe(() => {});
  }

  // =============================== edit employee ===================
  onEditEmployee(employee: IGetAllEmployee): void {
    this.updateDepartmentOptions();
    // this.updateUserOptions();

    const initialData = mapEmployeeToFormData(
      employee,
      this.departmentsList,
      this.usersList
    );

    const editFormConfig = this.createEditFormConfig();

    const dialogRef = this.openEmployeeDialog(editFormConfig, initialData);

    // Listen to submit event from FormUiComponent and only close on success
    const componentInstance = dialogRef.componentInstance;
    componentInstance.formSubmit.subscribe((formData: EmployeeFormData) => {
      if (employee.id) {
        this.updateEmployee(employee.id, formData, dialogRef);
      }
    });

    // Listen to departmentId changes to auto-generate empCode
    this.setupDepartmentChangeListener(componentInstance);

    // Keep afterClosed in case user cancels
    dialogRef.afterClosed().subscribe(() => {});
  }

  /**
   * Creates form configuration for edit mode
   */
  private createEditFormConfig() {
    return {
      ...this.employeeFormConfig,
      title: 'تعديل موظف',
      fields: this.employeeFormConfig.fields.map((field) => {
        const fieldCopy = {
          ...field,
          options: field.options ? [...field.options] : undefined,
        };

        // Show isActive field in edit mode (hidden in create mode)
        if (field.name === 'isActive') {
          fieldCopy.hidden = false;
        }

        // Ensure empUserId field has the updated options
        if (field.name === 'empUserId' && this.usersList.length > 0) {
          fieldCopy.options = this.usersList.map((user) => ({
            value: String(user.id),
            label: user.userName,
          }));
        }
        // Ensure departmentId field has the updated options
        if (field.name === 'departmentId' && this.departmentsList.length > 0) {
          fieldCopy.options = this.departmentsList.map((dept) => ({
            value: String(dept.id),
            label: dept.name,
          }));
        }
        return fieldCopy;
      }),
    };
  }

  /**
   * Opens employee dialog with given configuration
   */
  private openEmployeeDialog(
    config: any,
    initialData?: EmployeeFormInitialData
  ): EmployeeDialogRef {
    return this.dialog.open(FormUiComponent, {
      width: '80vw',
      maxWidth: '1000px',
      height: 'auto',
      maxHeight: '90vh',
      data: {
        config,
        ...(initialData && { initialData }),
      },
      disableClose: !!initialData, // Disable close only in edit mode
      panelClass: 'agreement-dialog',
      backdropClass: 'agreement-dialog-backdrop',
    });
  }

  // =============================== create employee ===================
  createEmployee(
    formData: EmployeeFormData,
    dialogRef?: EmployeeDialogRef
  ): void {
    const employeeData = mapFormDataToEmployee(formData);

    // Set loading state
    this.isCreatingEmployee = true;

    // Update form component loading state if dialog is open
    if (dialogRef) {
      const componentInstance = dialogRef.componentInstance;
      if (componentInstance) {
        componentInstance.isLoading = true;
      }
    }

    // Show loader
    this.spinner.show();

    this.employeeService.addEmployee(employeeData).subscribe({
      next: (response) => {
        this.handleCreateEmployeeSuccess(response, employeeData, dialogRef);
      },
      error: (error) => {
        this.handleCreateEmployeeError(error, dialogRef);
      },
    });
  }

  /**
   * Handles successful employee creation
   */
  private handleCreateEmployeeSuccess(
    response: any,
    employeeData: IEmployee,
    dialogRef?: EmployeeDialogRef
  ): void {
    // Reset loading state
    this.isCreatingEmployee = false;

    // Update form component loading state if dialog is open
    if (dialogRef) {
      const componentInstance = dialogRef.componentInstance;
      if (componentInstance) {
        componentInstance.isLoading = false;
      }
    }

    // Hide loader on success
    this.spinner.hide();

    if (response.succeeded && response.data) {
      // Merge server payload with submitted form to avoid empty card when API returns partial data
      const merged: IEmployee = {
        ...employeeData, // fallbacks for name/position/etc.
        ...(response.data as IEmployee),
      } as IEmployee;

      // Enrich with department name
      const enriched = enrichEmployeeWithDepartment(
        merged,
        this.departmentsList
      );

      // Update the list in the BehaviorSubject (this updates the UI instantly)
      this.employeesList$.next([enriched, ...this.employeesList$.value]);

      // Show success notification
      this.notify.success({
        title: 'تم الحفظ',
        description: response.data!.name
          ? `تم إضافة الموظف: ${response.data!.name}`
          : 'تم إضافة الموظف',
      });

      dialogRef?.close();
    } else if (response.succeeded) {
      // Some backends return success without the created entity
      // Fallback: refresh the list so the new record appears without manual refresh
      this.getEmployees();
      dialogRef?.close();
      this.notify.success({
        title: 'تم الحفظ',
        description: 'تم إضافة الموظف',
      });
    } else {
      console.error('API returned succeeded: false');
      this.notify.error({
        title: 'فشل الحفظ',
        description: 'حدث خطأ في إضافة الموظف',
      });
    }
  }

  /**
   * Handles errors when creating employee
   */
  private handleCreateEmployeeError(
    error: any,
    dialogRef?: EmployeeDialogRef
  ): void {
    // Reset loading state
    this.isCreatingEmployee = false;

    // Update form component loading state if dialog is open
    if (dialogRef) {
      const componentInstance = dialogRef.componentInstance;
      if (componentInstance) {
        componentInstance.isLoading = false;
      }
    }

    // Hide loader on error
    this.spinner.hide();

    console.error('Error details:', error.message, error.status);
    this.notify.error({
      title: 'فشل الحفظ',
      description: 'حدث خطأ في إضافة الموظف',
    });
  }

  // =============================== update employee ===================
  updateEmployee(
    employeeId: number,
    formData: EmployeeFormData,
    dialogRef?: EmployeeDialogRef
  ): void {
    const employeeData = mapFormDataToEmployee(formData, employeeId);

    this.employeeService.updateEmployee(employeeId, employeeData).subscribe({
      next: (response) => {
        this.handleUpdateEmployeeSuccess(
          response,
          employeeId,
          employeeData,
          dialogRef
        );
      },
      error: (error) => {
        this.handleUpdateEmployeeError(error);
      },
    });
  }

  /**
   * Handles successful employee update
   */
  private handleUpdateEmployeeSuccess(
    response: any,
    employeeId: number,
    employeeData: IEmployee,
    dialogRef?: EmployeeDialogRef
  ): void {
    if (response.data) {
      // Merge server payload with submitted form
      const merged: IEmployee = {
        ...employeeData,
        ...(response.data as IEmployee),
      } as IEmployee;

      // Enrich with department name
      const enriched = enrichEmployeeWithDepartment(
        merged,
        this.departmentsList
      );

      // Update the list in the BehaviorSubject
      const currentList = this.employeesList$.value || [];
      const updatedList = currentList.map((emp) =>
        emp.id === employeeId ? enriched : emp
      );
      this.employeesList$.next(updatedList);

      // Show success notification
      const employeeName = enriched.name || employeeData.name || 'الموظف';
      this.notify.success({
        title: 'تم التحديث',
        description: employeeName
          ? `تم تحديث الموظف: ${employeeName}`
          : 'تم تحديث الموظف',
      });

      dialogRef?.close();
    } else if (response.succeeded) {
      // Fallback: refresh the list
      this.getEmployees();
      dialogRef?.close();
      this.notify.success({
        title: 'تم التحديث',
        description: 'تم تحديث الموظف',
      });
    } else {
      console.error('API returned succeeded: false');
      this.notify.error({
        title: 'فشل التحديث',
        description: 'حدث خطأ في تحديث الموظف',
      });
    }
  }

  /**
   * Handles errors when updating employee
   */
  private handleUpdateEmployeeError(error: any): void {
    console.error('Error details:', error.message, error.status);
    this.notify.error({
      title: 'فشل التحديث',
      description: 'حدث خطأ في تحديث الموظف',
    });
  }

  // =============================== search and filter methods ===================
  onSearch(searchTerm: string): void {
    this.searchTerm = searchTerm || '';
    this.updateSearchState();
    this.getEmployees();
  }

  onStatusMethodChange(status: string): void {
    this.selectedStatus = status;
    this.updateSearchState();
    this.getEmployees();
  }

  onDepartmentChange(department: string): void {
    this.selectedDepartment = department;
    this.updateSearchState();
    this.getEmployees();
  }

  onFilterSubmit(): void {
    this.updateSearchState();
    this.getEmployees();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedDepartment = '';
    this.hasActiveSearch = false;
    this.hasActiveSearchTerm = false;
    this.filterForm.reset();
    this.getEmployees();
  }

  /**
   * Updates the search state flags
   */
  private updateSearchState(): void {
    this.hasActiveSearchTerm = !!this.searchTerm;
    this.hasActiveSearch =
      !!this.searchTerm || !!this.selectedStatus || !!this.selectedDepartment;
  }

  /**
   * Sets up listener for departmentId changes to auto-generate empCode
   */
  private setupDepartmentChangeListener(componentInstance: any): void {
    // Wait for form to be ready
    setTimeout(() => {
      const form = componentInstance.form;
      if (form && form.get('departmentId')) {
        form
          .get('departmentId')
          ?.valueChanges.subscribe((departmentId: string) => {
            if (departmentId) {
              const deptId = parseInt(departmentId, 10);
              if (!isNaN(deptId)) {
                this.generateEmployeeCode(deptId, form, componentInstance);
              }
            }
          });
      }
    }, 200);
  }

  /**
   * Generates employee code based on departmentId
   */
  private generateEmployeeCode(
    departmentId: number,
    form: any,
    componentInstance?: any
  ): void {
    this.employeeService.createEmployeeCode(departmentId).subscribe({
      next: (response) => {
        if (response.succeeded && response.data?.empCode) {
          const empCodeValue = response.data.empCode;

          // Set the empCode field value in the form
          const empCodeControl = form.get('empCode');
          if (empCodeControl) {
            // Use setValue to update the field
            empCodeControl.setValue(empCodeValue, {
              emitEvent: false,
              onlySelf: false,
            });

            // Also use patchValue on the form to ensure the value is set
            form.patchValue({ empCode: empCodeValue }, { emitEvent: false });

            // Mark the field as touched and dirty to show it has been updated
            empCodeControl.markAsTouched();
            empCodeControl.markAsDirty();

            // Update form validity
            form.updateValueAndValidity();

            // Force change detection if component instance is available
            if (componentInstance && componentInstance.cdr) {
              componentInstance.cdr.markForCheck();
            }
          } else {
            console.warn(
              'empCode field not found in form. Available fields:',
              Object.keys(form.controls)
            );
          }
        } else {
          console.warn('Failed to generate employee code:', response);
        }
      },
      error: (error) => {
        console.error('Error generating employee code:', error);
        // Don't show error to user, just log it
      },
    });
  }
}
