import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private Base_Url = environment.apiUrl;
  constructor(private http: HttpClient) {}
  // ===================================== card 1 ===============================
  GetExpectedLeads(): Observable<any> {
    return this.http.get(
      `${this.Base_Url}/AdminSalesDashboard/card1/GetExpectedLeads`
    );
  }
  // ===================================== card 2 ===============================
  GetConvertedLeads(): Observable<any> {
    return this.http.get(
      `${this.Base_Url}/AdminSalesDashboard/card2/GetConvertedLeads`
    );
  }
  // ===================================== card 3 ===============================
  GetTotalEarnSum(): Observable<any> {
    return this.http.get(
      `${this.Base_Url}/AdminSalesDashboard/card3/GetTotalEarnSum`
    );
  }
  // ===================================== card 4 ===============================
  GetAvreageDealMoney(): Observable<any> {
    return this.http.get(
      `${this.Base_Url}/AdminSalesDashboard/card/GetAvreageDealMoney`
    );
  }
}
