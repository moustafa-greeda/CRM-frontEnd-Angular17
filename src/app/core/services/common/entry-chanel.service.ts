import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../components/leads/distribution/distribution.service';
import { IEntryChanel } from '../../Models/common/entry-chanel';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EntryChanelService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAllEntryChanel(): Observable<{
    succeeded: boolean;
    data: IEntryChanel[];
  }> {
    return this.http.get<{ succeeded: boolean; data: IEntryChanel[] }>(
      `${this.BASE_API_URL}/Client/GetAllEntryChanel`
    );
  }
}
