import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/Models/api-response.model';
import { IFollowUp } from './interfaces/IFollowUp';

@Injectable({
  providedIn: 'root',
})
export class FollowUpTableTeleSalseService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private _http: HttpClient) {}
  // ==================================== get all follow up ===========================================

  getFollowUpTableTeleSales(
    searchTerm: any,
    dateFilter: number,
    pageIndex: number,
    pageSize: number
  ): Observable<ApiResponse<{ items: IFollowUp[]; totalCount: number }>> {
    let params = new HttpParams();
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    if (dateFilter !== null && dateFilter !== undefined) {
      params = params.set('dateFilter', dateFilter);
    }
    // if (pageIndex) {
    if (pageIndex !== null && pageIndex !== undefined) {
      params = params.set('pageIndex', String(pageIndex));
    }
    // if (pageSize) {
    if (pageSize !== null && pageSize !== undefined) {
      params = params.set('pageSize', String(pageSize));
    }
    return this._http.get<
      ApiResponse<{ items: IFollowUp[]; totalCount: number }>
    >(`${this.BASE_API_URL}/Client/TeleGetFollowUpAsync`, { params });
  }
}
