import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContactFilterParams {
  ageFrom?: number;
  ageTo?: number;
  country?: string;
  city?: string;
  jobTitle?: string;
  jobLevel?: string;
  industryId?: number;
  companyId?: number;
  pageIndex?: number;
  pageSize?: number;
  personality?: string;
  customerType?: string;
  language?: string;
  department?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PersonalServiceService {
  private BASE_API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}
  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  getCitiesByCountryId(id: number): Observable<any> {
    return this.http.get(
      `${this.BASE_API_URL}/Filter/GetCitiesByCountryId/${id}`
    );
  }

  // Get all countries from the correct API endpoint
  getAllCountries(): Observable<any> {
    return this.http.get(`${this.BASE_API_URL}/Filter/GetAllCountries`);
  }

  GetJobTitle(): Observable<any> {
    return this.http.get(`${this.BASE_API_URL}/Filter/GetJobTitle`);
  }

  GetJobLevel(): Observable<any> {
    return this.http.get(`${this.BASE_API_URL}/Filter/GetJobLevel`);
  }

  GetIndustry(): Observable<any> {
    return this.http.get(`${this.BASE_API_URL}/Filter/Company/GetIndustry`);
  }

  GetComapnySize(): Observable<any> {
    return this.http.get(`${this.BASE_API_URL}/Filter/Company/GetComapnySize`);
  }

  GetContacts(params?: ContactFilterParams): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.ageFrom !== undefined) {
        httpParams = httpParams.set('ageFrom', params.ageFrom.toString());
      }
      if (params.ageTo !== undefined) {
        httpParams = httpParams.set('ageTo', params.ageTo.toString());
      }
      if (params.country) {
        httpParams = httpParams.set('country', params.country);
      }
      if (params.city !== undefined) {
        httpParams = httpParams.set('city', params.city.toString());
      }
      if (params.jobTitle) {
        httpParams = httpParams.set('jobTitle', params.jobTitle);
      }
      if (params.jobLevel) {
        httpParams = httpParams.set('jobLevel', params.jobLevel);
      }
      if (params.industryId !== undefined) {
        httpParams = httpParams.set('industryId', params.industryId.toString());
      }
      if (params.companyId !== undefined) {
        httpParams = httpParams.set('companyId', params.companyId.toString());
      }
      if (params.pageIndex !== undefined) {
        httpParams = httpParams.set('pageIndex', params.pageIndex.toString());
      }
      if (params.pageSize !== undefined) {
        httpParams = httpParams.set('pageSize', params.pageSize.toString());
      }
      if (params.personality) {
        httpParams = httpParams.set('personality', params.personality);
      }
      if (params.customerType) {
        httpParams = httpParams.set('customerType', params.customerType);
      }
      if (params.language) {
        httpParams = httpParams.set('language', params.language);
      }
      if (params.department) {
        httpParams = httpParams.set('department', params.department);
      }
    }

    const finalUrl = `${
      this.BASE_API_URL
    }/Filter/GetContacts?${httpParams.toString()}`;

    return this.http.get(`${this.BASE_API_URL}/Filter/GetContacts`, {
      params: httpParams,
      headers: this.getHeaders(),
    });
  }
}
