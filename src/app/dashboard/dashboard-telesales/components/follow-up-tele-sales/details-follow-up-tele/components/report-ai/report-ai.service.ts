import { Injectable } from '@angular/core';
import { environment } from '../../../../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../../../../core/Models/api-response.model';
import { IReportAiForLead } from '../../../interfaces/IFollowUp';

@Injectable({
  providedIn: 'root',
})
export class ReportAiService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private _http: HttpClient) {}
  // ==================================== get report ai for lead by id ===========================================
  getReportAiForLeadById(
    id: string
  ): Observable<ApiResponse<IReportAiForLead[]>> {
    const headers = new HttpHeaders().set('contactId', id);
    return this._http.get<ApiResponse<IReportAiForLead[]>>(
      `${this.BASE_API_URL}/Client/GetClientWithInsight`,
      { headers }
    );
  }
}
