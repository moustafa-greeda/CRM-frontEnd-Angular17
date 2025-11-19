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

    // Add search parameters to the query string (only if they have values)
    if (
      searchParams.name &&
      typeof searchParams.name === 'string' &&
      searchParams.name.trim()
    ) {
      params = params.set('name', searchParams.name.trim());
    }
    if (
      searchParams.phone &&
      typeof searchParams.phone === 'string' &&
      searchParams.phone.trim()
    ) {
      params = params.set('phone', searchParams.phone.trim());
    }
    if (
      searchParams.companyName &&
      typeof searchParams.companyName === 'string' &&
      searchParams.companyName.trim()
    ) {
      params = params.set('companyName', searchParams.companyName.trim());
    }
    if (
      searchParams.email &&
      typeof searchParams.email === 'string' &&
      searchParams.email.trim()
    ) {
      params = params.set('email', searchParams.email.trim());
    }
    if (
      searchParams.jobTitle &&
      typeof searchParams.jobTitle === 'string' &&
      searchParams.jobTitle.trim()
    ) {
      params = params.set('jobTitle', searchParams.jobTitle.trim());
    }
    if (searchParams.id !== undefined && searchParams.id !== null) {
      params = params.set('id', searchParams.id.toString());
    }
    if (
      searchParams.sortField &&
      typeof searchParams.sortField === 'string' &&
      searchParams.sortField.trim()
    ) {
      params = params.set('sortField', searchParams.sortField.trim());
    }
    if (
      searchParams.sortDirection &&
      typeof searchParams.sortDirection === 'string' &&
      searchParams.sortDirection.trim()
    ) {
      params = params.set('sortDirection', searchParams.sortDirection.trim());
    }
    if (
      searchParams.pageIndex !== undefined &&
      searchParams.pageIndex !== null
    ) {
      params = params.set('pageIndex', searchParams.pageIndex.toString());
    }
    if (searchParams.pageSize !== undefined && searchParams.pageSize !== null) {
      params = params.set('pageSize', searchParams.pageSize.toString());
    }
    // Send searchKeyword if provided (this is important for general search)
    if (
      searchParams.searchKeyword !== undefined &&
      searchParams.searchKeyword !== null
    ) {
      const keyword =
        typeof searchParams.searchKeyword === 'string'
          ? searchParams.searchKeyword.trim()
          : String(searchParams.searchKeyword).trim();
      if (keyword) {
        params = params.set('searchKeyword', keyword);
      }
    }
    if (
      searchParams.isLeadContact !== undefined &&
      searchParams.isLeadContact !== null
    ) {
      params = params.set(
        'isLeadContact',
        searchParams.isLeadContact.toString()
      );
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
