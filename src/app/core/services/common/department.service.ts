import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IDepartment } from '../../Models/common/idepartment';
import { ApiResponse } from '../../Models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}
  getAllDepartments(): Observable<{ succeeded: boolean; data: IDepartment[] }> {
    return this.http.get<{ succeeded: boolean; data: IDepartment[] }>(
      `${this.BASE_API_URL}/Employee/GetAllDepartments`
    );
  }
}
