import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/Models/api-response.model';
import { IContact } from '../../../core/Models/leads/IContact';

@Injectable({
  providedIn: 'root',
})
export class WizardLeadService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}
  // =========================== CreateCustomer ===========================
  createContact(data: IContact): Observable<ApiResponse<IContact>> {
    return this.http.post<ApiResponse<IContact>>(
      `${this.BASE_API_URL}/Client/CreateCustomer`,
      data
    );
  }
}
