import { Injectable } from '@angular/core';
import { IEmployee } from '../../core/Models/employee/iemployee';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private BASE_API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}
  add(employe: IEmployee): Observable<IEmployee> {
    return this.http.post<IEmployee>(
      `${this.BASE_API_URL}/Employee/CreateEmployee`,
      employe
    );
    // .pipe(tap(() => this.refreshDepartments()));
  }

  update(id: number, department: Partial<IEmployee>): Observable<any> {
    let params = new HttpParams().set('Id', id);

    if (department.name) params = params.set('Name', department.name);
    // if (department.description)
    //   params = params.set('Description', department.description);

    return this.http.put(`${this.BASE_API_URL}/Department`, null, { params });
    // .pipe(tap(() => this.refreshDepartments()));
  }
}
