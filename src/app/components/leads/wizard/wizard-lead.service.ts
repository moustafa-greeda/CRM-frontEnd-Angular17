import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/Models/api-response.model';

export interface IContact {
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
  leadSourceLookupId?: number; // Lead source ID from clientSource field
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
  createEmployee(data: IContact): Observable<ApiResponse<IContact>> {
    return this.http.post<ApiResponse<IContact>>(
      `${this.BASE_API_URL}/Client/CreateCustomer`,
      data
    );
  }
}
