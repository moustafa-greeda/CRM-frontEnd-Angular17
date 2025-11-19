import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICallStatus } from '../../Models/common/call-status';
import { ApiResponse } from '../../Models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class CallStatusService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}
  // ==================================== get all call status ===========================================
  getAllCallStatus(): Observable<ApiResponse<ICallStatus[]>> {
    return this.http.get<ApiResponse<ICallStatus[]>>(
      `${this.BASE_API_URL}/Client/GetCallStatus`
    );
  }
}
