import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../../core/Models/api-response.model';
import { IFollowUpPersonal } from '../interfaces/IFollowUp';

@Injectable({
  providedIn: 'root',
})
export class FollowupDetailsService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private _http: HttpClient) {}

  // =============================== get all follow up by id ===========================================
  getFollowUpDetailsById(
    id: string
  ): Observable<ApiResponse<IFollowUpPersonal[]>> {
    const headers = new HttpHeaders().set('contactId', id);
    return this._http.get<ApiResponse<IFollowUpPersonal[]>>(
      `${this.BASE_API_URL}/Client/GetClientHistoryByContactIdAsync`,
      { headers }
    );
  }
}
