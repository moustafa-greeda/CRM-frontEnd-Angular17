import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../../core/Models/api-response.model';
import { IGetAllExpenses } from '../../../../core/Models/invoices/Invoice';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  private apiUrl = environment.apiUrl;
  constructor(private _http: HttpClient) {}
  // ------------------------ Get All Expenses ------------------------------
  getExpenses(): Observable<ApiResponse<IGetAllExpenses[]>> {
    return this._http.get<ApiResponse<IGetAllExpenses[]>>(
      `${this.apiUrl}/Account/GetAllExpenses`
    );
  }
}
