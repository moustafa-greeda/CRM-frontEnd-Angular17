import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../Models/api-response.model';
import { ICompanies } from '../../Models/common/icompanies';

export interface PaginatedCompaniesResponse {
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  items: ICompanies[];
}

@Injectable({
  providedIn: 'root',
})
export class GetAllCompaniseService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAllCompanise(
    pageIndex: number = 1,
    pageSize: number = 10
  ): Observable<ApiResponse<PaginatedCompaniesResponse>> {
    const params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());

    const url = `${this.BASE_API_URL}/Client/GetAllCompanyNew`;
    console.log('Service: Making API call', {
      url,
      pageIndex,
      pageSize,
      params: params.toString(),
    });

    return this.http.get<ApiResponse<PaginatedCompaniesResponse>>(url, {
      params,
    });
  }
}
