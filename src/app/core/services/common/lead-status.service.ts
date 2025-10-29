import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ILeadStatus } from '../../Models/common/ilead-status';
import { ApiResponse } from '../../Models/api-response.model';

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
}
