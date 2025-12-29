import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class FollowUpTableTeleSalseService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private _http: HttpClient) {}
  // ==================================== get all follow up ===========================================
}
