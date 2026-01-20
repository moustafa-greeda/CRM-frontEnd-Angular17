import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormUiComponent } from '../../../../shared/components/form-ui/form-ui.component';
import { EMPLOYEE_FORM_CONFIG } from '../../../../shared/configs';
import {
  IEmployee,
  IGetAllEmployee,
  EmployeeFormData,
  EmployeeFormInitialData,
} from '../../../../core/Models/employee/iemployee';
import { IDepartment } from '../../../../core/Models/common/idepartment';
import { User } from '../../../../core/Models/user/user.model';
import { EmployeeService } from '../employee.service';
import { distinctUntilChanged, skip } from 'rxjs/operators';

export interface FormConfig {
  fields: any[];
  title?: string;
  [key: string]: any;
}

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

  const userExists = usersList.some((user) => {
    const userIdStr = String(user.id).trim();
    return userIdStr === empUserIdValue;
  });

  if (userExists) {
    return empUserIdValue;
  }

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
 */
function mapEmployeeToFormData(
  employee: IEmployee | IGetAllEmployee,
  departmentsList: IDepartment[],
  usersList: User[]
): EmployeeFormInitialData {
  let departmentId: number | undefined = (employee as IEmployee).departmentId;
  if (!departmentId && employee.departmentName && departmentsList.length > 0) {
    const department = departmentsList.find(
      (dept) => dept.name === employee.departmentName
    );
    departmentId = department?.id;
  }

  const genderValue = normalizeGender(employee.gender || '');
  const positionValue = normalizePosition(employee.position || '');
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

@Injectable({
  providedIn: 'root',
})
export class EmployeeFormHandler {
  private employeeFormConfig: FormConfig = { ...EMPLOYEE_FORM_CONFIG };

  constructor(
    private dialog: MatDialog,
    private employeeService: EmployeeService
  ) {}

  openForm(
    employee: IGetAllEmployee | null,
    data: {
      departments: IDepartment[];
      users: User[];
    },
    callbacks: {
      onGenerateEmpCode: (departmentId: number) => void;
      onSubmit: (
        formData: EmployeeFormData,
        isEdit: boolean,
        employeeId?: number
      ) => void;
    }
  ): MatDialogRef<FormUiComponent> {
    const isEditMode = !!employee && !!employee.id;

    // Update form config with options
    this.updateFormOptions(data);

    const formConfig = {
      ...this.employeeFormConfig,
      title: isEditMode ? 'تعديل موظف' : 'إضافة موظف',
    };

    let initialData: EmployeeFormInitialData | undefined;

    if (isEditMode && employee) {
      initialData = mapEmployeeToFormData(
        employee,
        data.departments,
        data.users
      );
    } else {
      // Set default value for isActive = true when creating
      initialData = {
        isActive: true,
      } as EmployeeFormInitialData;
    }

    const dialogRef = this.dialog.open(FormUiComponent, {
      width: '80vw',
      maxWidth: '1000px',
      height: 'auto',
      maxHeight: '90vh',
      data: {
        config: formConfig,
        ...(initialData && { initialData }),
      },
      disableClose: !!initialData,
      panelClass: 'agreement-dialog',
      backdropClass: 'agreement-dialog-backdrop',
    });

    // Handle form submission
    const componentInstance = dialogRef.componentInstance;
    componentInstance.formSubmit.subscribe((formData: EmployeeFormData) => {
      callbacks.onSubmit(formData, isEditMode, employee?.id);
    });

    // Setup form watchers
    this.setupFormWatchers(componentInstance, callbacks.onGenerateEmpCode);

    return dialogRef;
  }

  private updateFormOptions(data: {
    departments: IDepartment[];
    users: User[];
  }): void {
    // Update department options
    const departmentField = this.employeeFormConfig.fields.find(
      (field) => field.name === 'departmentId'
    );
    if (departmentField && data.departments.length > 0) {
      departmentField.options = data.departments.map((dept) => ({
        value: String(dept.id),
        label: dept.name,
      }));
    }

    // Update user options for empUserId field
    const empUserIdField = this.employeeFormConfig.fields.find(
      (field) => field.name === 'empUserId'
    );
    if (empUserIdField && data.users.length > 0) {
      empUserIdField.options = data.users.map((user) => ({
        value: String(user.id),
        label: user.userName,
      }));
    }
  }

  private setupFormWatchers(
    componentInstance: any,
    onGenerateEmpCode: (departmentId: number) => void
  ): void {
    setTimeout(() => {
      const form = componentInstance.form;
      if (!form || !form.get('departmentId')) return;

      form
        .get('departmentId')
        ?.valueChanges.pipe(
          distinctUntilChanged(), // Prevent duplicate calls for same value
          skip(1) // Skip initial value emission
        )
        .subscribe((departmentId: string) => {
          if (departmentId) {
            const deptId = parseInt(departmentId, 10);
            if (!isNaN(deptId)) {
              onGenerateEmpCode(deptId);
            }
          }
        });
    }, 200);
  }

  /**
   * Generates employee code based on departmentId
   */
  generateEmployeeCode(
    departmentId: number,
    form: any,
    componentInstance?: any
  ): void {
    this.employeeService.createEmployeeCode(departmentId).subscribe({
      next: (response) => {
        if (response.succeeded && response.data?.empCode) {
          const empCodeValue = response.data.empCode;

          const empCodeControl = form.get('empCode');
          if (empCodeControl) {
            empCodeControl.setValue(empCodeValue, {
              emitEvent: false,
              onlySelf: false,
            });

            form.patchValue({ empCode: empCodeValue }, { emitEvent: false });

            empCodeControl.markAsTouched();
            empCodeControl.markAsDirty();

            form.updateValueAndValidity();

            if (componentInstance && componentInstance.cdr) {
              componentInstance.cdr.markForCheck();
            }
          }
        }
      },
      error: (error) => {
        console.error('Error generating employee code:', error);
      },
    });
  }
}
