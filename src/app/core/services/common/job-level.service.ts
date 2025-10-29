import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../../components/leads/distribution/distribution.service';
import { IJobLevel } from '../../Models/common/ijob-level';

@Injectable({
  providedIn: 'root',
})
export class JobLevelService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}
  // =============================== get All Job Levels ====================================
  getAllJobLevels(): Observable<ApiResponse<IJobLevel[]>> {
    return this.http.get<ApiResponse<IJobLevel[]>>(
      `${this.BASE_API_URL}/Client/GetjobLevel`
    );
  }
}
