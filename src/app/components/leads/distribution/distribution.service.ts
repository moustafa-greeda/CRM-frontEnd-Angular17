import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ITeleSalse } from '../../../core/Models/employee/itele-salse';
import { ILeadDistribution } from '../../../core/Models/leads/ilead-distribution';

export interface AssignLeadDto {
  leadId: number;
  teleSalesId: number;
  assignedBy?: string;
  assignedAt?: string;
  notes?: string;
}

export type AssignGroupsRequest = AssignLeadDto[];

export interface ApiResponse<T = any> {
  succeeded: boolean;
  message?: string;
  data?: T;
}

export interface CreateLeadRequest {
  contactId: number;
}

export interface LeadsResponse {
  totalCount: number;
  items: ILeadDistribution[];
}

export interface GetAllLeadsResponse extends ApiResponse<LeadsResponse> {}

@Injectable({ providedIn: 'root' })
export class DistributionService {
  private readonly baseUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  //==================================== get all teleSalse ===========================================
  getAllTeleSalse(): Observable<ApiResponse<ITeleSalse[]>> {
    return this.http.get<ApiResponse<ITeleSalse[]>>(
      `${this.baseUrl}/Employee/GetAllTeleSels`
    );
  }

  // ==================================== get all leads ===========================================
  getAllLeads(
    page: number = 1,
    pageSize: number = 10,
    searchTerm: string = '',
    isAssigned?: boolean
  ): Observable<GetAllLeadsResponse> {
    // Build query parameters manually
    const queryParams: string[] = [];

    // Always include pageIndex
    queryParams.push(`pageIndex=${page}`);

    // Always include pageSize
    queryParams.push(`pageSize=${pageSize}`);

    if (searchTerm && searchTerm.trim()) {
      queryParams.push(`searchKeyword=${encodeURIComponent(searchTerm)}`);
    }

    if (isAssigned !== undefined) {
      queryParams.push(`isAssigned=${isAssigned}`);
    }

    const url = `${
      this.baseUrl
    }/Client/GetAllLeadsWithFilters?${queryParams.join('&')}`;

    return this.http.get<GetAllLeadsResponse>(url);
  }
  //=========================================== assign leads to employee==============================
  assignGroups(payload: AssignGroupsRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.baseUrl}/Client/AssignLeadsToEmployee`,
      payload
    );
  }

  // ==================================== create lead after make customer ===============================
  createLeadAfterMakeCustomer(
    payload: CreateLeadRequest
  ): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(
      `${this.baseUrl}/Client/CreateLead`,
      payload
    );
  }
}
