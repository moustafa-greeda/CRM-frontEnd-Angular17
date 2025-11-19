import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../Models/api-response.model';
import { IIndustry } from '../../Models/common/iIndustry';

@Injectable({
  providedIn: 'root',
})
export class IndustryService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}
  getAllIndustries(): Observable<{ message: IIndustry[] }> {
    return this.http.get<{ message: IIndustry[] }>(
      `${this.BASE_API_URL}/Client/GetIndustry`
    );
  }
}
