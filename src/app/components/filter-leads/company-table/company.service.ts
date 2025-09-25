import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CompanyFilterParams {
  name?: string;
  country?: string;
  city?: string;
  industryName?: string;
  companySize?: string;
  ownerShip?: string;
  digitalTransformation?: string;
  sortField?: string;
  sortDirection?: string;
  pageIndex?: number;
  pageSize?: number;
  searchKeyword?: string;
  companyStage?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private BASE_API_URL = environment.apiUrl;

  constructor(private http: HttpClient) { }

  GetAllCompanyDropDown(): Observable<any> {
    return this.http.get(`${this.BASE_API_URL}/Filter/Company/GetAllCompanyDropDown`);
  }

  // ================================= GetCompanyStage ===========================

  GetCompanyStage(): Observable<any> {
    return this.http.get(`${this.BASE_API_URL}/Filter/Company/GetCompanyStage`);
  }

  // ================================= GetAllOwnerShip ===========================
  GetAllOwnerShip(): Observable<any> {
    return this.http.get(`${this.BASE_API_URL}/Filter/Company/GetAllOwnerShip`);
  }

  // ================================= Get ALL data of Companies ===========================
  GetCompanies(params?: CompanyFilterParams): Observable<any> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof CompanyFilterParams];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    
    return this.http.get(`${this.BASE_API_URL}/Filter/Company/GetCompanies`, { params: httpParams });
  }
}
