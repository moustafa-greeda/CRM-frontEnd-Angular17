import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface FilterResponse<T> {
  succeeded: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getIndustries(): Observable<FilterResponse<any>> {
    return this.http.get<FilterResponse<any>>(
      `${this.baseUrl}/Filter/Industry/GetAll`
    );
  }

  getCountries(): Observable<FilterResponse<any>> {
    return this.http.get<FilterResponse<any>>(
      `${this.baseUrl}/Filter/Country/GetAll`
    );
  }

  getCities(countryId: number | string): Observable<FilterResponse<any>> {
    return this.http.get<FilterResponse<any>>(
      `${this.baseUrl}/Filter/City/GetAll?countryId=${countryId}`
    );
  }

  getJobLevels(): Observable<FilterResponse<any>> {
    return this.http.get<FilterResponse<any>>(
      `${this.baseUrl}/Filter/JobLevel/GetAll`
    );
  }

  getDepartments(): Observable<FilterResponse<any>> {
    return this.http.get<FilterResponse<any>>(
      `${this.baseUrl}/Filter/Department/GetAll`
    );
  }
}
