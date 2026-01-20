import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/Models/api-response.model';
import { IGetAllInvoiceData } from '../../../core/Models/invoices/Invoice';

@Injectable({
  providedIn: 'root',
})
export class InvoicesService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private _http: HttpClient) {}

  // ===================================== Get All Invoices ===========================================
  getAllInvoices(
    query?: InvoiceQueryParams
  ): Observable<ApiResponse<IGetAllInvoiceData>> {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }

    return this._http.get<ApiResponse<IGetAllInvoiceData>>(
      `${this.BASE_API_URL}/Account/GetAllInvoiceData`,
      { params }
    );
  }
}

export interface InvoiceQueryParams {
  clientName?: string;
  clientPhone?: string;
  paymentMethod?: number;
  fromDate?: string;
  toDate?: string;
  id?: number | string;
  sortField?: string;
  sortDirection?: string;
  pageIndex?: number;
  pageSize?: number;
}
