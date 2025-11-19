import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../core/Models/api-response.model';
import { ITransferredLeadsData } from '../../core/Models/teleSalse/itransferred-leads-to-sales';

@Injectable({
  providedIn: 'root',
})
export class TeleSalesService {
  private Base_Url = environment.apiUrl;
  constructor(private http: HttpClient) {}
  // ========================================= GetAllCallCount =================================
  GetAllCallCount(): Observable<any> {
    return this.http.get(
      `${this.Base_Url}/AdminTeleSalesDashboard/card/GetAllCallCount`
    );
  }
  // ================================ GetTotalInterstedLeadsCount ==============================
  GetTotalInterstedLeads(): Observable<any> {
    return this.http.get(
      `${this.Base_Url}/AdminTeleSalesDashboard/cards/GetTotalInterstedLeadsCount`
    );
  }
  // ======================================= conversionRate ====================================
  conversionRate(): Observable<any> {
    return this.http.get(
      `${this.Base_Url}/AdminTeleSalesDashboard/cards/GetTotalConvertionLeadsCount`
    );
  }
  // ================================= AverageCallDuration ======================================
  AverageCallDuration(): Observable<any> {
    return this.http.get(
      `${this.Base_Url}/AdminTeleSalesDashboard/cards/GetAverageCallDuration`
    );
  }
  // ================================= GetAvregCallCounts ======================================
  GetAvregCallCounts(): Observable<any> {
    return this.http.get(
      `${this.Base_Url}/AdminTeleSalesDashboard/cards/GetTeleSalesAvregCallCounts`
    );
  }
  // ======================================== totalRejected ====================================
  totalRejected(): Observable<any> {
    return this.http.get(
      `${this.Base_Url}/AdminTeleSalesDashboard/cards/GetTotalRejectedLeads`
    );
  }
  // ==================================== GetTotalRescheduledCalls ==============================
  TotalRescheduledCalls(): Observable<any> {
    return this.http.get(
      `${this.Base_Url}/AdminTeleSalesDashboard/cards/GetTotalRescheduledCalls`
    );
  }
  // ==================================== GetTotalCallWithNoAnswer ==============================
  GetTotalCallWithNoAnswer(): Observable<any> {
    return this.http.get(
      `${this.Base_Url}/AdminTeleSalesDashboard/card/GetTotalCallWithNoAnswer`
    );
  }
  // ==================================== GetTransferredLeadsToSales ============================
  GetTransferredLeadsToSales(): Observable<ApiResponse<ITransferredLeadsData>> {
    return this.http.get<ApiResponse<ITransferredLeadsData>>(
      `${this.Base_Url}/AdminTeleSalesDashboard/chart/GetTransferredLeadsToSales`
    );
  }
}
