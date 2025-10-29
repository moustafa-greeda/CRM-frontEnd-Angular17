import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICallStatus } from '../../Models/common/call-status';

@Injectable({
  providedIn: 'root',
})
export class CallStatusService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}
  // ==================================== get all call status ===========================================
  getAllCallStatus(): Observable<ICallStatus> {
    return this.http.get<ICallStatus>(
      `${this.BASE_API_URL}/Client/GetCallStatus`
    );
  }
}
