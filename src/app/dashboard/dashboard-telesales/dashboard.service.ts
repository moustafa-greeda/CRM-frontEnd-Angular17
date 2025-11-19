import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ITeleSalseActionResponse,
  ITeleSalseActionRequest,
  IRecentInteractionsResponse,
} from '../../core/Models/teleSalse/itele-salse-action';
import { INotificationResponse } from '../../core/Models/teleSalse/inotification';
import { GetTeleSalesTableDataRequest } from '../../core/Models/teleSalse/get-tele-sales-table-data-request';
import { ApiResponse } from '../../core/Models/api-response.model';
import {
  AssignLeadsToSalesRequest,
  EditLeadStatusRequest,
} from '../../core/Models/teleSalse/tele-sales-dashboard.types';

@Injectable({
  providedIn: 'root',
})
export class DashboardTeleService {
  private BASE_API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}
  // ==================================== get total calls this month ===========================================
  getCallCountTele(): Observable<any> {
    return this.http.get(
      `${this.BASE_API_URL}/Client/GetMyTotalSalesCountThisMonth`
    );
  }
  // ==================================== get total close leads this month ===========================================
  GetMyClosedLeads(): Observable<any> {
    return this.http.get(
      `${this.BASE_API_URL}/Client/GetMyClosedLeadsThisMonth`
    );
  }
  // ==================================== get total salse this month ===========================================
  GettelesalesTotalLeadCount(): Observable<any> {
    return this.http.get(
      `${this.BASE_API_URL}/Client/GettelesalesTotalLeadCount`
    );
  }
  // ==================================== get total clients this month ===========================================
  GetAverageCallDurationThisMonth(): Observable<any> {
    return this.http.get(
      `${this.BASE_API_URL}/Client/GetAverageCallDurationThisMonth`
    );
  }

  // ============================== get leads belongs to tele sales ==================
  getLeadsBelongsToTeleSales(
    payload: GetTeleSalesTableDataRequest
  ): Observable<any> {
    const url = `${this.BASE_API_URL}/Client/GetTeleSalesTableData`;
    let params = new HttpParams();
    if (payload.pageIndex !== undefined) {
      params = params.set('pageIndex', String(payload.pageIndex));
    }
    if (payload.pageSize !== undefined) {
      params = params.set('pageSize', String(payload.pageSize));
    }
    // Add other filters if needed
    if (payload.contactName)
      params = params.set('contactName', payload.contactName);
    if (payload.leadStatus)
      params = params.set('leadStatus', payload.leadStatus);
    if (payload.country) params = params.set('country', payload.country);
    if (
      payload.searchKeyword !== undefined &&
      payload.searchKeyword !== null &&
      String(payload.searchKeyword).trim() !== ''
    ) {
      params = params.set(
        'searchKeyword',
        String(payload.searchKeyword).trim()
      );
    }
    if (
      payload.actionDateFilter !== undefined &&
      payload.actionDateFilter !== null
    ) {
      params = params.set('actionDateFilter', String(payload.actionDateFilter));
    }
    if (payload.lastActionTime) {
      params = params.set('lastActionTime', payload.lastActionTime);
    }
    if (payload.city) params = params.set('city', payload.city);
    if (payload.assigndate)
      params = params.set('assigndate', payload.assigndate);

    return this.http.get(url, { params });
  }

  // ==================================== get tele sales actions ===========================================
  getTeleSalesActions(
    employeeId: number,
    startDate?: string,
    actionNotes?: string,
    endDate?: string
  ): Observable<ITeleSalseActionResponse> {
    let url = `${this.BASE_API_URL}/Client/GetTelesalesActionsForAssignedLeadsThisMonthGrouped?employeeId=${employeeId}`;

    if (startDate) {
      url += `&startDate=${startDate}`;
    }
    if (endDate) {
      url += `&endDate=${endDate}`;
    }

    return this.http.get<ITeleSalseActionResponse>(url);
  }
  // ==================================== create tele sales action ===========================================
  createTeleSalesAction(data: ITeleSalseActionRequest): Observable<any> {
    return this.http.post(
      `${this.BASE_API_URL}/Client/CreateTeleSealsAction`,
      data
    );
  }

  // ==================================== get recent interactions ===========================================
  getRecentInteractions(): Observable<IRecentInteractionsResponse> {
    return this.http.get<IRecentInteractionsResponse>(
      `${this.BASE_API_URL}/Client/GetAllLastFiveTeleSalesAction`
    );
  }

  // ==================================== get notification list for teleSales ===========================================
  getNotifications(): Observable<INotificationResponse> {
    return this.http.get<INotificationResponse>(
      `${this.BASE_API_URL}/Notfication/GetNotficationForMe`
    );
  }
  // ==================================== update lead status ===========================================
  editLeadStatus(payload: EditLeadStatusRequest): Observable<any> {
    const url = `${this.BASE_API_URL}/Client/UpdateLeadStatus`;
    const body: any = {
      leadId: payload.leadId,
      leadStatus: payload.leadStatus,
    };

    // Only include assignLeadId if it's provided and greater than 0
    if (payload.assignLeadId && payload.assignLeadId > 0) {
      body.assignLeadId = payload.assignLeadId;
    }

    return this.http.put(url, body);
  }
  //=================================== Assign Leads To Sales ================================
  AssignLeadsToSales(
    payload: AssignLeadsToSalesRequest[]
  ): Observable<ApiResponse<AssignLeadsToSalesRequest>> {
    return this.http.post<ApiResponse<AssignLeadsToSalesRequest>>(
      `${this.BASE_API_URL}/SalesDashbored/AssignLeadsToSales`,
      payload
    );
  }
}
