import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  IRecentInteractionsResponse,
  ITeleSalseActionRequest,
  ITeleSalseActionResponse,
} from '../../core/Models/teleSalse/itele-salse-action';
import { INotificationResponse } from '../../core/Models/teleSalse/inotification';
import { EditLeadStatusRequest } from '../../core/Models/teleSalse/tele-sales-dashboard.types';
import { ISales } from '../../core/Models/sales/isales';
import { ApiResponse } from '../../core/Models/api-response.model';
import { GetTeleSalesTableDataRequest } from '../../core/Models/teleSalse/get-tele-sales-table-data-request';

@Injectable({
  providedIn: 'root',
})
export class DashboardSalseService {
  private BASE_API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}
  // ================================ get total leads assignments this month =======================================
  LeadAssignmentsCountSales(): Observable<any> {
    return this.http.get(
      `${this.BASE_API_URL}/SalesDashbored/GetMyLeadAssignmentsCountThisMonthSales`
    );
  }
  // ==================================== get total close leads this month ===========================================
  GetMyClosedLeads(): Observable<any> {
    return this.http.get(
      `${this.BASE_API_URL}/SalesDashbored/GetClosedLeadCountAtThisMonth`
    );
  }
  // ==================================== get total GetTotalMoney this month ===========================================
  GetTotalMoney(): Observable<any> {
    // Return budgets per currency for current salesperson
    return this.http.get(
      `${this.BASE_API_URL}/SalesDashbored/GetTotalBudgetAtThisMonth`
    );
  }
  // ================================ get total clients waiting for follow up this month ===========================================
  GetWaitingForFollowUp(): Observable<any> {
    return this.http.get(
      `${this.BASE_API_URL}/SalesDashbored/GetFollowUpCount`
    );
  }

  // ******************************** get leads belongs to tele sales *************************
  getLeadsBelongsToSales(
    payload: GetTeleSalesTableDataRequest
  ): Observable<ApiResponse<ISales>> {
    const url = `${this.BASE_API_URL}/SalesDashbored/GetSalesTableData`;
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
    if (payload.city) params = params.set('city', payload.city);
    return this.http.get<ApiResponse<ISales>>(url, { params });
  }

  // ==================================== get tele sales actions ===========================================
  getSalesActions(
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
  createSalesAction(data: ITeleSalseActionRequest): Observable<any> {
    return this.http.post(
      `${this.BASE_API_URL}/SalesDashbored/createAction`,
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

  // ==================================== update sales budget ===========================================
  updateSalesBudget(id: number, budget: number): Observable<any> {
    const url = `${this.BASE_API_URL}/SalesDashbored/update-sales-budget/${id}`;
    // API expects raw number in body with application/json
    return this.http.put(url, budget, {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // ==================================== update lead status ===========================================
  editLeadStatus(
    payload: EditLeadStatusRequest & { assignmentId?: number }
  ): Observable<any> {
    // API expects the assignment id in the query param (named leadId by backend)
    const assignmentId = (payload as any).assignmentId ?? payload.leadId;
    const url = `${this.BASE_API_URL}/SalesDashbored/UpdateSalesLeadStatus?leadId=${assignmentId}`;
    const body: any = {
      leadId: payload.leadId,
      assignmentId: assignmentId,
      leadStatus: payload.leadStatus,
    };

    // Only include assignLeadId if it's provided and greater than 0
    if (payload.assignLeadId && payload.assignLeadId > 0) {
      body.assignLeadId = payload.assignLeadId;
    }

    return this.http.put(url, body);
  }
}
