import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse } from '../../../../core/Models/api-response.model';
import { Observable } from 'rxjs';
import { IGetAllContract } from '../../../../core/Models/contract/Icontract.model';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  private BaseApiUrl = environment.apiUrl;
  constructor(private _http: HttpClient) {}
  // ===================================== create contract ==========================
  createContract(formData: FormData): Observable<ApiResponse<any>> {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    return new Observable<ApiResponse<any>>((observer) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${this.BaseApiUrl}/Account/CreateContract`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('Accept', '*/*');
      // لا نضيف Content-Type header - المتصفح سيفعل ذلك تلقائياً مع boundary
      xhr.onload = () => {
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            observer.next(parsed);
            observer.complete();
          } else {
            observer.error(parsed);
          }
        } catch (e) {
          observer.error(e);
        }
      };
      xhr.onerror = () => observer.error(new Error('Network error'));
      xhr.send(formData);
    });
  }
  // ===================================== get all contracts =====================================

  getAllContracts(
    filters?: Partial<IGetAllContract>
  ): Observable<ApiResponse<{ items: IGetAllContract[] }>> {
    let params = new HttpParams();

    Object.keys(filters || {}).forEach((key) => {
      const value = filters?.[key as keyof IGetAllContract];
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this._http.get<ApiResponse<{ items: IGetAllContract[] }>>(
      `${this.BaseApiUrl}/Account/GetAllContractAssignment`,
      { params }
    );
  }
}
