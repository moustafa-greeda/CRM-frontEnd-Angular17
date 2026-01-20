import { Injectable, signal, computed } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { EmployeeService } from '../employee.service';
import { DepartmentService } from '../../../../core/services/common/department.service';
import { AllUsersService } from '../../../../core/services/common/all-users.service';
import {
  IEmployee,
  IGetAllEmployee,
  EmployeeFilters,
} from '../../../../core/Models/employee/iemployee';
import { IDepartment } from '../../../../core/Models/common/idepartment';
import { User } from '../../../../core/Models/user/user.model';

export interface EmployeeListResponse {
  employees: IGetAllEmployee[];
  totalCount: number;
}

export interface InitialData {
  departments: IDepartment[];
  users: User[];
  departmentOptions: string[];
}

/**
 * Maps department names to employees
 */
function mapDepartmentNamesToEmployees(
  employees: IGetAllEmployee[],
  departmentsList: IDepartment[]
): IGetAllEmployee[] {
  return employees.map((employee) => {
    if (employee.departmentName && employee.departmentName.trim().length > 0) {
      return employee;
    }

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

@Injectable({
  providedIn: 'root',
})
export class EmployeeDataService {
  // Signals for reactive state management
  private departments = signal<IDepartment[]>([]);
  private users = signal<User[]>([]);

  // Public computed signals
  readonly departments$ = this.departments.asReadonly();
  readonly users$ = this.users.asReadonly();

  // Computed signals for derived data
  readonly departmentOptions = computed(() =>
    this.departments().map((dept) => dept.name)
  );

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private allUsersService: AllUsersService
  ) {}

  /**
   * Load all initial data (departments and users)
   */
  loadAllInitialData(): Observable<InitialData> {
    return forkJoin({
      departments: this.departmentService
        .getAllDepartments()
        .pipe(
          catchError(() => of({ succeeded: false, data: [] })),
          map((response) => (response.succeeded ? response.data || [] : []))
        ),
      users: this.allUsersService
        .getAllUsers()
        .pipe(
          catchError(() => of({ succeeded: false, data: { items: [] } })),
          map((response) => (response.succeeded ? response.data?.items || [] : []))
        ),
    }).pipe(
      tap((responses) => {
        this.departments.set(responses.departments);
        this.users.set(responses.users);
      }),
      map((responses) => ({
        departments: responses.departments,
        users: responses.users,
        departmentOptions: responses.departments.map((dept) => dept.name),
      }))
    );
  }

  /**
   * Load employees with filters
   */
  loadEmployees(filters?: EmployeeFilters): Observable<EmployeeListResponse> {
    return this.employeeService.getAllEmployees(filters).pipe(
      map((response) => {
        if (response.succeeded && response.data) {
          const convertedList = convertEmployeesToGetAll(
            response.data,
            this.departments()
          );
          const mappedList = mapDepartmentNamesToEmployees(
            convertedList,
            this.departments()
          );
          return {
            employees: mappedList,
            totalCount: mappedList.length,
          };
        }
        return { employees: [], totalCount: 0 };
      }),
      catchError(() => of({ employees: [], totalCount: 0 }))
    );
  }

  /**
   * Get current departments
   */
  getCurrentDepartments(): IDepartment[] {
    return this.departments();
  }

  /**
   * Get current users
   */
  getCurrentUsers(): User[] {
    return this.users();
  }

  /**
   * Enrich employee with department name
   */
  enrichEmployeeWithDepartment(employee: IEmployee): IGetAllEmployee {
    return enrichEmployeeWithDepartment(employee, this.departments());
  }
}
