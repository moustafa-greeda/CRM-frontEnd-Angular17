import { Injectable, signal } from '@angular/core';
import { EmployeeService } from '../employee.service';
import { NotifyDialogService } from '../../../../shared/components/notify-dialog-host/notify-dialog.service';
import {
  IEmployee,
  EmployeeFormData,
} from '../../../../core/Models/employee/iemployee';

/**
 * Maps form data to employee data structure
 */
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

@Injectable({
  providedIn: 'root',
})
export class EmployeeCrudService {
  // Operation state signals
  private isCreating = signal<boolean>(false);
  private isUpdating = signal<boolean>(false);
  private isDeleting = signal<boolean>(false);

  // Public readonly signals
  readonly isCreating$ = this.isCreating.asReadonly();
  readonly isUpdating$ = this.isUpdating.asReadonly();
  readonly isDeleting$ = this.isDeleting.asReadonly();

  // Computed signal for any operation in progress
  readonly isOperationInProgress = signal<boolean>(false);

  constructor(
    private employeeService: EmployeeService,
    private notify: NotifyDialogService
  ) {}

  createEmployee(
    formData: EmployeeFormData,
    onSuccess: (employee: IEmployee) => void,
    onComplete: () => void
  ): void {
    this.isCreating.set(true);
    this.isOperationInProgress.set(true);

    const employeeData = mapFormDataToEmployee(formData);

    this.employeeService.addEmployee(employeeData).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          // Merge server payload with submitted form
          const merged: IEmployee = {
            ...employeeData,
            ...(response.data as IEmployee),
          } as IEmployee;

          this.notify.success({
            title: 'تم الحفظ',
            description: response.data!.name
              ? `تم إضافة الموظف: ${response.data!.name}`
              : 'تم إضافة الموظف',
          });

          onSuccess(merged);
        } else if (response.succeeded) {
          this.notify.success({
            title: 'تم الحفظ',
            description: 'تم إضافة الموظف',
          });
          onSuccess(employeeData);
        } else {
          this.notify.error({
            title: 'فشل الحفظ',
            description: 'حدث خطأ في إضافة الموظف',
          });
        }
        this.isCreating.set(false);
        this.isOperationInProgress.set(false);
        onComplete();
      },
      error: (error) => {
        this.notify.error({
          title: 'فشل الحفظ',
          description: error?.error?.message || 'حدث خطأ في إضافة الموظف',
        });
        this.isCreating.set(false);
        this.isOperationInProgress.set(false);
        onComplete();
      },
    });
  }

  updateEmployee(
    employeeId: number,
    formData: EmployeeFormData,
    onSuccess: (employee: IEmployee) => void,
    onComplete: () => void
  ): void {
    this.isUpdating.set(true);
    this.isOperationInProgress.set(true);

    const employeeData = mapFormDataToEmployee(formData, employeeId);

    this.employeeService.updateEmployee(employeeId, employeeData).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          // Merge server payload with submitted form
          const merged: IEmployee = {
            ...employeeData,
            ...(response.data as IEmployee),
          } as IEmployee;

          const employeeName = merged.name || employeeData.name || 'الموظف';
          this.notify.success({
            title: 'تم التحديث',
            description: employeeName
              ? `تم تحديث الموظف: ${employeeName}`
              : 'تم تحديث الموظف',
          });

          onSuccess(merged);
        } else if (response.succeeded) {
          this.notify.success({
            title: 'تم التحديث',
            description: 'تم تحديث الموظف',
          });
          onSuccess(employeeData);
        } else {
          this.notify.error({
            title: 'فشل التحديث',
            description: 'حدث خطأ في تحديث الموظف',
          });
        }
        this.isUpdating.set(false);
        this.isOperationInProgress.set(false);
        onComplete();
      },
      error: (error) => {
        this.notify.error({
          title: 'فشل التحديث',
          description: error?.error?.message || 'حدث خطأ في تحديث الموظف',
        });
        this.isUpdating.set(false);
        this.isOperationInProgress.set(false);
        onComplete();
      },
    });
  }

  deleteEmployee(employeeId: number, onSuccess?: () => void): void {
    this.isDeleting.set(true);
    this.isOperationInProgress.set(true);

    // TODO: Implement delete functionality when API is available
    this.notify.error({
      title: 'تنبيه',
      description: 'حذف الموظف غير متاح حالياً.',
    });

    this.isDeleting.set(false);
    this.isOperationInProgress.set(false);

    // When delete API is ready, use this pattern:
    /*
    this.employeeService.deleteEmployee(employeeId).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.notify.success({
            title: 'نجاح',
            description: 'تم حذف الموظف بنجاح',
          });
          onSuccess?.();
        } else {
          this.notify.error({
            title: 'خطأ',
            description: response.message || 'فشل حذف الموظف',
          });
        }
        this.isDeleting.set(false);
        this.isOperationInProgress.set(false);
      },
      error: (error) => {
        this.notify.error({
          title: 'خطأ',
          description: error?.error?.message || 'حدث خطأ أثناء حذف الموظف',
        });
        this.isDeleting.set(false);
        this.isOperationInProgress.set(false);
      },
    });
    */
  }

  // Reset operation states (useful for cleanup)
  resetOperationStates(): void {
    this.isCreating.set(false);
    this.isUpdating.set(false);
    this.isDeleting.set(false);
    this.isOperationInProgress.set(false);
  }
}
