import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InvoicesAdminService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private _http: HttpClient) {}
  // ==================================== Get total Invoices card ====================================
  getTotalInvoicesCard(): Observable<any> {
    return this._http.get<any>(
      `${this.BASE_API_URL}/Account/AdminCards/InvoiceTotalCount`
    );
  }
  // ==================================== Get total Paid Invoices card ===============================
  getTotalPaidInvoicesCard(): Observable<any> {
    return this._http.get<any>(
      `${this.BASE_API_URL}/Account/AdminCards/CountTotalInvoicePayed`
    );
  }
  // ==================================== Get total Unpaid Invoices card ===============================
  getTotalUnpaidInvoicesCard(): Observable<any> {
    return this._http.get<any>(
      `${this.BASE_API_URL}/Account/AdminCards/CountTotalInvoiceUnPayed`
    );
  }
  // ==================================== Get total Cancelled Invoices card ===============================
  // getTotalCancelledInvoicesCard(): Observable<any> {
  //   return this._http.get<any>(
  //     `${this.BASE_API_URL}/Account/AdminCards/InvoiceTotalCountCancelled`
  //   );
  // }
}
