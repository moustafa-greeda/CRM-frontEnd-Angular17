import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../core/Models/api-response.model';
import {
  IAccountAssignment,
  IAddInvoiceRequest,
} from '../../../../core/Models/invoices/Invoice';

@Injectable({
  providedIn: 'root',
})
export class InvoicesWorkOrdersService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}

  // ===================================== Get All Account Assignments ===========================================
  getAllAccountAssignments(): Observable<ApiResponse<IAccountAssignment[]>> {
    return this.http.get<ApiResponse<IAccountAssignment[]>>(
      `${this.BASE_API_URL}/Account/GetAllAccountAssignments`
    );
  }

  // ===================================== Account add  invoice ===========================================
  addInvoice(
    invoice: IAddInvoiceRequest
  ): Observable<ApiResponse<IAddInvoiceRequest>> {
    return this.http.post<ApiResponse<IAddInvoiceRequest>>(
      `${this.BASE_API_URL}/Account/generate-invoice`,
      invoice
    );
  }
}
