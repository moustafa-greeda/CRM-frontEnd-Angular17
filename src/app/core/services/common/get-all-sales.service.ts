import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetAllSalesService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}
  // ================================ get all sales ===========================================
  getAllSales(): Observable<any> {
    return this.http.get(`${this.BASE_API_URL}/Employee/GetAllSales`);
  }
}
