import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  IcovertcontactToLead,
  ILeadsResponse,
  ILeadsSearchParams,
} from '../../core/Models/leads/ileads';

@Injectable({
  providedIn: 'root',
})
export class LeadsService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // ================================= GetAllLeads ===========================
  GetAllLeads(): Observable<ILeadsResponse> {
    return this.http.get<ILeadsResponse>(
      `${this.BASE_API_URL}/Client/GetAllContactsCards`
    );
  }

  // ================================= SearchLeads ===========================
  SearchLeads(searchParams: ILeadsSearchParams): Observable<ILeadsResponse> {
    let params = new HttpParams();

    // Add search parameters to the query string
    if (searchParams.name) {
      params = params.set('name', searchParams.name);
    }
    if (searchParams.phone) {
      params = params.set('phone', searchParams.phone);
    }
    if (searchParams.companyName) {
      params = params.set('companyName', searchParams.companyName);
    }
    if (searchParams.email) {
      params = params.set('email', searchParams.email);
    }
    if (searchParams.jobTitle) {
      params = params.set('jobTitle', searchParams.jobTitle);
    }
    if (searchParams.id) {
      params = params.set('id', searchParams.id.toString());
    }
    if (searchParams.sortField) {
      params = params.set('sortField', searchParams.sortField);
    }
    if (searchParams.sortDirection) {
      params = params.set('sortDirection', searchParams.sortDirection);
    }
    if (searchParams.pageIndex !== undefined) {
      params = params.set('pageIndex', searchParams.pageIndex.toString());
    }
    if (searchParams.pageSize !== undefined) {
      params = params.set('pageSize', searchParams.pageSize.toString());
    }
    if (searchParams.searchKeyword) {
      params = params.set('searchKeyword', searchParams.searchKeyword);
    }

    return this.http.get<ILeadsResponse>(
      `${this.BASE_API_URL}/Client/GetAllContactsCards`,
      { params }
    );
  }

  // ================================= convert contact to client  ===========================
  ConvertContactToClient(payload: IcovertcontactToLead): Observable<any> {
    return this.http.post<any>(`${this.BASE_API_URL}/Client/CreateLead`, {
      payload,
    });
  }

  // ================================= CreateLead ===========================
  CreateLead(
    contactId: number,
    leadStatusLookupId: number = 1
  ): Observable<any> {
    const payload = {
      contactId: contactId,
      leadStatusLookupId: leadStatusLookupId,
    };
    return this.http.post<any>(
      `${this.BASE_API_URL}/Client/CreateLead`,
      payload
    );
  }
}
