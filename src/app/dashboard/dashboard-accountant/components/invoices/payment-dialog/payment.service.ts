import { Injectable } from '@angular/core';
import { environment } from '../../../../../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { IPayment } from '../../../../../core/Models/invoices/Invoice';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private Base_Url = environment.apiUrl;
  constructor(private http: HttpClient) {}
  // ============================================ create payment ============================================
  createPayment(payment: IPayment): Observable<HttpResponse<Blob>> {
    return this.http.post(
      `${this.Base_Url}/Account/createInstallment`,
      payment,
      {
        responseType: 'blob',
        observe: 'response',
      }
    );
  }
  // ============================================ get payment by invoice id ============================================
  getPaymentByInvoiceId(invoiceId: number): Observable<{ data: IPayment[] }> {
    return this.http.get<{ data: IPayment[] }>(
      `${this.Base_Url}/Account/invoice/${invoiceId}/instalments`
    );
  }
}
