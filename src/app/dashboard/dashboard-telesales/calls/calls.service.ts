import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/Models/api-response.model';
import { ICall } from '../../../core/Models/teleSalse/ICall';

// Interface for GetAllCallForTeleSales API response
export interface ICallStatusResponse {
  id: number;
  status: string;
}

export interface ICallResponse {
  id: number;
  employeeId: number;
  leadId: number;
  callDate: string;
  callstatus: ICallStatusResponse;
  telesalesCalls: any;
  callDuration: number;
  nextCall: string;
  calloutcome: string;
  notes: string;
}

export interface IGetAllCallsForTeleSalesData {
  employeeId: number;
  startOfMonth: string;
  endOfMonth: string;
  totalcalls: number;
  calls: ICallResponse[];
}

@Injectable({
  providedIn: 'root',
})
export class CallsService {
  private BASE_API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ==================================== get all calls for telesales employee ===========================================
  getAllCallsForTeleSales(
    employeeId: number
  ): Observable<ApiResponse<IGetAllCallsForTeleSalesData>> {
    const params = new HttpParams().set('empid', employeeId);
    return this.http.get<ApiResponse<IGetAllCallsForTeleSalesData>>(
      `${this.BASE_API_URL}/Client/GetAllCallForTeleSales`,
      { params }
    );
  }

  // ==================================== create call ===========================================
  createCall(call: ICall): Observable<ApiResponse<ICall>> {
    return this.http.post<ApiResponse<ICall>>(
      `${this.BASE_API_URL}/Client/CreateTeleSalesCall`,
      call
    );
  }
}
