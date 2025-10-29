import { Injectable } from '@angular/core';
import { ApiResponse } from '../../Models/api-response.model';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICurruncy } from '../../Models/common/icurruncy';

@Injectable({
  providedIn: 'root',
})
export class CurruncyService {
  constructor(private http: HttpClient) {}
  private BASE_API_URL = environment.apiUrl;
  // ==================================== get all curruncy ========================================
  getCurruncy(): Observable<ApiResponse<ICurruncy[]>> {
    return this.http.get<ApiResponse<ICurruncy[]>>(
      `${this.BASE_API_URL}/SalesDashbored/GetCurruncyForCurruntLead`
    );
  }
}
