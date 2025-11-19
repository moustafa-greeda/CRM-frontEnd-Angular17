import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../leads/distribution/distribution.service';
import { IEmployee } from '../../../core/Models/employee/iemployee';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private BASE_API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // =============================== get auth headers ===================
  private getAuthHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');

    let headers = new HttpHeaders({
      Accept: '*/*',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    // Don't set Content-Type - let Angular handle it for FormData
    return headers;
  }

  // =============================== get employees ===================
  getAllEmployees(): Observable<ApiResponse<IEmployee[]>> {
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<IEmployee[]>>(
      `${this.BASE_API_URL}/Employee/GetAllEmployee`,
      { headers }
    );
  }

  // =============================== add employee ===================
  addEmployee(employee: IEmployee): Observable<ApiResponse<IEmployee>> {
    return this.addEmployeeWithFormData(employee);
  }

  // =============================== add employee with FormData ===================
  addEmployeeWithFormData(
    employee: IEmployee
  ): Observable<ApiResponse<IEmployee>> {
    const formData = this.createFormData(employee);
    return this.postFormData(`${this.BASE_API_URL}/Employee/create`, formData);
  }

  // =============================== create FormData ===================
  private createFormData(employee: IEmployee): FormData {
    const fd = new FormData();
    // Keep exact field names/order expected by backend
    this.append(fd, 'empCode', employee.empCode);
    this.append(fd, 'Name', employee.name); // Capital N
    this.append(fd, 'email', employee.email);
    this.append(fd, 'phoneNumber', employee.phoneNumber);
    this.append(fd, 'dateOfBirth', this.formatDate(employee.dateOfBirth));
    this.append(fd, 'hireDate', this.formatDate(employee.hireDate));
    this.append(fd, 'departmentId', employee.departmentId?.toString());
    this.append(fd, 'position', employee.position);
    this.append(fd, 'salary', employee.salary?.toString() ?? '0');
    this.append(fd, 'address', employee.address);
    this.append(fd, 'gender', employee.gender);
    this.append(fd, 'isActive', String(employee.isActive));
    this.append(fd, 'empUserId', employee.empUserId);
    if (employee.file instanceof File) {
      fd.append('file', employee.file, employee.file.name);
    }
    return fd;
  }

  // =============================== helpers ===================
  private formatDate(value?: string): string {
    if (!value) return '';
    return new Date(value).toISOString().split('T')[0];
  }

  private append(fd: FormData, key: string, value?: string): void {
    fd.append(key, value ?? '');
  }

  private postFormData(
    url: string,
    formData: FormData
  ): Observable<ApiResponse<IEmployee>> {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    return new Observable<ApiResponse<IEmployee>>((observer) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Accept', '*/*');
      xhr.onload = () => {
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            observer.next(parsed);
            observer.complete();
          } else {
            observer.error(parsed);
          }
        } catch (e) {
          observer.error(e);
        }
      };
      xhr.onerror = () => observer.error(new Error('Network error'));
      xhr.send(formData);
    });
  }
}
