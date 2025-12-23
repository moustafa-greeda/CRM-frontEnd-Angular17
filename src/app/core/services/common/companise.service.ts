import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../Models/api-response.model';
import {
  companiesResponse,
  ICompanies,
  ICompanyFilter,
  ICompanyFilterResponse,
  ICreateCompany,
} from '../../Models/common/icompanies';

@Injectable({
  providedIn: 'root',
})
export class GetAllCompaniseService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // ================================= get all company with filter =====================
  getAllCompanyWithFilter(
    filter?: ICompanyFilter
  ): Observable<ApiResponse<ICompanyFilterResponse>> {
    let params = new HttpParams();
    if (filter?.searchKeyword) {
      params = params.set('searchKeyword', filter.searchKeyword.toString());
    }
    if (filter?.countryName) {
      params = params.set('countryName', filter.countryName);
    }
    if (filter?.cityName) {
      params = params.set('cityName', filter.cityName);
    }
    if (filter?.pageIndex) {
      params = params.set('pageIndex', filter.pageIndex.toString());
    }
    if (filter?.pageSize) {
      params = params.set('pageSize', filter.pageSize.toString());
    }

    const url = `${this.BASE_API_URL}/Company/GetAllCompanyWithFilters`;

    return this.http.get<ApiResponse<ICompanyFilterResponse>>(url, {
      params,
    });
  }
  // ================================= get all company =================================

  getAllCompanise(
    pageIndex: number = 1,
    pageSize: number = 10
  ): Observable<ApiResponse<companiesResponse>> {
    const params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());

    const url = `${this.BASE_API_URL}/Client/GetAllCompanyNew`;
    return this.http.get<ApiResponse<companiesResponse>>(url, {
      params,
    });
  }

  // ================================= create company =================================
  createCompany(company: ICreateCompany): Observable<ApiResponse<ICompanies>> {
    const url = `${this.BASE_API_URL}/Company/CreateCompany`;
    return this.http.post<ApiResponse<ICompanies>>(url, company);
  }
}
