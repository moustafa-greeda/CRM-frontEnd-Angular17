import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { IEmployee } from '../../../core/Models/employee/iemployee';
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

  constructor(
    private employeeService: EmployeeService,
    private dialog: MatDialog,
    private _departmentService: DepartmentService,
    private _allUsersService: AllUsersService,
    private notify: NotifyDialogService
  ) {}

  employeeFormConfig = { ...EMPLOYEE_FORM_CONFIG };

  /** Action Buttons */
  actionButtons: ActionButton[] = [
    {
      label: 'إضافة موظف',
      iconClass: 'bi bi-plus',
      click: () => this.onAddEmployee(),
    },
    {
      iconClass: 'bi bi-box-arrow-in-up',
      click: () => console.log('Upload'),
      tooltip: 'Upload',
    },
    {
      iconClass: 'bi bi-box-arrow-right',
      click: () => console.log('Download'),
      tooltip: 'Download',
    },
  ];
  // Reactive source for list
  employeesList$ = new BehaviorSubject<IEmployee[]>([]);

  ngOnInit(): void {
    this.getEmployees();
    this.getDepartments();
    this.getAllUsersList();
  }

  // =============================== get employees ===================
  getEmployees(): void {
    this.employeeService.getAllEmployees().subscribe((response) => {
      const list = response.data || [];
      this.employeesList$.next(list);
      this.mapDepartmentNames();
    });
  }

  // =============================== map department names ===================
  private mapDepartmentNames(): void {
    const updated = (this.employeesList$.value || []).map((employee) => {
      // Prefer value coming from API if already present
      if (
        employee.departmentName &&
        employee.departmentName.trim().length > 0
      ) {
        return employee;
      }
      const department = this.departmentsList.find(
        (dept) => Number(dept.id) === Number(employee.departmentId)
      );
      return {
        ...employee,
        departmentName: department?.name || 'غير محدد',
      } as IEmployee;
    });
    this.employeesList$.next(updated);
  }

  trackByClientId(index: number, employee: IEmployee): number {
    return employee.id || index;
  }

  // =============================== get departments ===================
  getDepartments(): void {
    this._departmentService.getAllDepartments().subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.departmentsList = response.data || [];

          // Update form configuration with department options
          this.DepartmentOptions();

          // Map department names to existing employees
          this.mapDepartmentNames();
        } else {
          console.error('API returned succeeded: false');
          this.departmentsList = [];
        }
      },
      error: (error) => {
        console.error('Error details:', error.message, error.status);
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
          this.updateUserOptions();
        } else {
          console.error('Users API returned succeeded: false');
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
  private DepartmentOptions(): void {
    const departmentField = this.employeeFormConfig.fields.find(
      (field) => field.name === 'departmentId'
    );
    if (departmentField && this.departmentsList.length > 0) {
      departmentField.options = this.departmentsList.map((dept) => ({
        value: dept.id,
        label: dept.name,
      }));
    }
  }

  // =============================== update user options ===================
  private updateUserOptions(): void {
    const userField = this.employeeFormConfig.fields.find(
      (field) => field.name === 'empUserId'
    );

    if (userField && this.usersList.length > 0) {
      userField.options = this.usersList.map((user) => ({
        value: user.id,
        label: user.userName,
      }));
    }
  }

  // =============================== add employee ===================
  onAddEmployee() {
    this.DepartmentOptions();
    this.updateUserOptions();

    const dialogRef = this.dialog.open(FormUiComponent, {
      width: '80vw',
      maxWidth: '1000px',
      height: 'auto',
      maxHeight: '90vh',
      data: {
        config: this.employeeFormConfig,
      },
      disableClose: true,
      panelClass: 'agreement-dialog',
    });

    // Listen to submit event from FormUiComponent and only close on success
    const componentInstance = dialogRef.componentInstance;
    componentInstance.formSubmit.subscribe((result: any) => {
      this.createEmployee(result, dialogRef);
    });

    // Keep afterClosed in case user cancels
    dialogRef.afterClosed().subscribe(() => {});
  }

  // =============================== create employee ===================
  createEmployee(formData: any, dialogRef?: any): void {
    const employeeData: IEmployee = {
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
      departmentId: parseInt(formData.departmentId),
      salary: parseFloat(formData.salary) || 0,
      gender: formData.gender,
      isActive: formData.isActive === 'true' || formData.isActive === true,
      file: formData.file,
      address: formData.address || '',
      empUserId: formData.empUserId || '',
    };

    // Call the API to add the employee and update list only on success
    this.employeeService.addEmployee(employeeData).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          // Merge server payload with submitted form to avoid empty card when API returns partial data
          const merged: IEmployee = {
            ...employeeData, // fallbacks for name/position/etc.
            ...(response.data as IEmployee),
          } as IEmployee;

          // Set department name for the new employee (ensure numeric compare)
          const deptId = Number(
            merged.departmentId ?? (response.data as IEmployee).departmentId
          );
          const department = this.departmentsList.find(
            (dept) => Number(dept.id) === deptId
          );
          merged.departmentName = department?.name || 'غير محدد';

          // Update the list in the BehaviorSubject (this updates the UI instantly)
          this.employeesList$.next([merged, ...this.employeesList$.value]);

          // Show a success notification
          this.notify.success({
            title: 'تم الحفظ',
            description: `تم إضافة الموظف: ${response.data!.name}`,
            autoCloseMs: 2500,
          });

          // Close the dialog on success
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
      },
      error: (error) => {
        console.error('Error details:', error.message, error.status);
        this.notify.error({
          title: 'فشل الحفظ',
          description: 'حدث خطأ في إضافة الموظف',
        });
      },
    });
  }
}
