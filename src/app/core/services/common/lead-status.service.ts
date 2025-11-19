import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ILeadStatus } from '../../Models/common/ilead-status';
import { ApiResponse } from '../../Models/api-response.model';
import { IClientSource } from '../../Models/common/iclient-source';

@Injectable({
  providedIn: 'root',
})
export class LeadStatusService {
  private BASE_API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllLeadStatus(): Observable<ApiResponse<ILeadStatus[]>> {
    return this.http.get<ApiResponse<ILeadStatus[]>>(
      `${this.BASE_API_URL}/Client/GetLeadStatus`
    );
  }

  // ==================================== get all client source ===========================================
  getAllClientSource(): Observable<ApiResponse<IClientSource[]>> {
    return this.http.get<ApiResponse<IClientSource[]>>(
      `${this.BASE_API_URL}/Client/ClientSource`
    );
  }
}
