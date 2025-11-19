import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../leads/distribution/distribution.service';
import { Observable } from 'rxjs';
import { IPostLead } from '../../core/Models/leads/ipost-lead';

export interface IDropDownImportedData {
  importJobId: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExportDataService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}
  // ==================================== get all  DropDownImportedDatabyJobId ==========================================
  getDropDownImportedDatabyJobId(
    jobId: string
  ): Observable<ApiResponse<IDropDownImportedData[]>> {
    return this.http.get<ApiResponse<IDropDownImportedData[]>>(
      `${this.BASE_API_URL}/Client/DropDownImportedDatabyJobId?jobId=${jobId}`
    );
  }
  // ==================================== get all GetArchivedData ==========================================
  GetArchivedData(
    jobId: string
  ): Observable<ApiResponse<{ items: IPostLead[]; totalCount: number }>> {
    return this.http.get<
      ApiResponse<{ items: IPostLead[]; totalCount: number }>
    >(`${this.BASE_API_URL}/Client/GetArchivedData?jobId=${jobId}`);
  }
}
