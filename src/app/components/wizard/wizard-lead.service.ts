import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../core/Models/api-response.model';
import { ILeads } from '../../core/Models/leads/ileads';

export interface Employee {
  id?: number;
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  age: number;
  industeryId: number; // Note: API uses 'industeryId' not 'industryId'
  locationId: number; // Required by API
  companyId?: number; // Optional
  prefaredLanguage: string; // Note: API uses 'prefaredLanguage' not 'preferredLanguage'
  jobLevelLookupId: number;
  notes: string;
  isHaveSoialMedia: boolean; // Note: API uses 'isHaveSoialMedia' not 'isHaveSocialMedia'
  socialMediaLink: string;
  webSiteUrl: string;
  gender: number; // 0 = Male, 1 = Female, etc.
  cityId: number;
  countryId: number;
  postalCode: string;
  addressLine: string;
}

@Injectable({
  providedIn: 'root',
})
export class WizardLeadService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}
  // =========================== CreateCustomer ===========================
  createEmployee(data: Employee): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(
      `${this.BASE_API_URL}/Client/CreateCustomer`,
      data
    );
  }
}
