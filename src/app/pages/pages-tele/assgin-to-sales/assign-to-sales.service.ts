import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IAssignSalse } from './IAssignSalse';

@Injectable({
  providedIn: 'root',
})
export class AssignToSalesService {
  private apiUrl = environment.apiUrl;
  constructor(private _http: HttpClient) {
    this.getAssignToSales();
  }
  getAssignToSales(): Observable<IAssignSalse[]> {
    return this._http.get<IAssignSalse[]>(`${this.apiUrl}/api/assign-to-sales`);
  }
}
