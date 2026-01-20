import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../core/Models/api-response.model';
import {
  ExpensesQueryParams,
  IAddExpenses,
  IGetAllExpensesData,
} from '../../../core/Models/invoices/Invoice';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  private apiUrl = environment.apiUrl;
  constructor(private _http: HttpClient) {}
  // ------------------------ Get All Expenses ------------------------------
  getExpenses(
    query?: ExpensesQueryParams
  ): Observable<ApiResponse<IGetAllExpensesData>> {
    let params = new HttpParams();
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }

    return this._http.get<ApiResponse<IGetAllExpensesData>>(
      `${this.apiUrl}/Account/GetAllExpenses`,
      { params }
    );
  }
  // ------------------------------ add expenses ------------------------------------
  addExpenses(data: IAddExpenses): Observable<ApiResponse<IAddExpenses>> {
    return this._http.post<ApiResponse<IAddExpenses>>(
      `${this.apiUrl}/Account/AddExpense`,
      data
    );
  }
}
