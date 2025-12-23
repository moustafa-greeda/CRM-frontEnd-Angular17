import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GetAllCompanySizeService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}
  getAllCompanySizes(): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(
      `${this.BASE_API_URL}/Company/GetAllCompanySize`
    );
  }
}
