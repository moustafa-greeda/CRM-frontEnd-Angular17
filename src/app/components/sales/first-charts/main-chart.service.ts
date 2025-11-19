import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MainChartService {
  Base_Url = environment.apiUrl;
  constructor(private http: HttpClient) {}

  //============================== GetDailyRevenueChart ================================
  GetDailyRevenueChart(): Observable<any> {
    return this.http.get(
      `${this.Base_Url}/AdminSalesDashboard/chart/GetDailyRevenueChart`
    );
  }
  //============================== GetLeadStatusPercentagesAsync ================================
  GetLeadStatusPercentagesAsync(): Observable<any> {
    return this.http.get(
      `${this.Base_Url}/AdminSalesDashboard/Chart-Dounat/GetLeadStatusPercentagesAsync`
    );
  }
}
