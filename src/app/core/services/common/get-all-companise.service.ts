import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../Models/api-response.model';
import { ICompanies } from '../../Models/common/icompanies';

@Injectable({
  providedIn: 'root',
})
export class GetAllCompaniseService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}
  getAllCompanise(): Observable<ApiResponse<ICompanies[]>> {
    return this.http.get<ApiResponse<ICompanies[]>>(
      `${this.BASE_API_URL}/Client/GetCompanyDropDown`
    );
  }
}
