export interface IEmployee {
  id?: number;
  empCode: string;
  name: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  hireDate?: string;
  departmentId: number;
  position: string;
  salary: number;
  address: string;
  gender: string;
  isActive?: boolean;
  empUserId: string;
  file?: File;
  departmentName?: string;
}

export interface EmployeeFilters {
  isActive?: boolean;
  departmentId?: number;
  empCode?: string;
  empName?: string;
}

/**
 * Form data structure from FormUiComponent
 */
export interface EmployeeFormData {
  name: string;
  phoneNumber: string;
  email: string;
  empCode: string;
  position: string;
  dateOfBirth?: string;
  hireDate?: string;
  departmentId: string;
  salary: string;
  gender: string;
  isActive: boolean | string;
  address?: string;
  empUserId?: string;
  file?: File;
}

/**
 * Initial data structure for edit form
 */
export interface EmployeeFormInitialData {
  name: string;
  phoneNumber: string;
  email: string;
  empCode: string;
  position: string;
  dateOfBirth: string;
  hireDate: string;
  departmentId: string;
  salary: string;
  gender: string;
  isActive: boolean;
  address: string;
  empUserId: string;
}

/**
 * Dialog reference type
 */

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  succeeded: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface IGetAllEmployee {
  id?: number;
  name: string;
  isActive: boolean;
  email: string;
  empCode: string;
  phoneNumber: string;
  hireDate: string;
  salary: number;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  position: string;
  imagePath: string | File | null;
  departmentName: string;
  address: string;
}
