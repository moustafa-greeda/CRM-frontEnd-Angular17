import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CountCardService {
  private BASE_API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCountCompanies(): Observable<any> {
    return this.http.get(`${this.BASE_API_URL}/Filter/Count/GetAllCompanies`);
  }

  getCountContacts(): Observable<any> {
    return this.http.get(`${this.BASE_API_URL}/Filter/Count/GetAllContact`);
  }

  getCountClients(): Observable<any> {
    return this.http.get(`${this.BASE_API_URL}/Filter/Count/GetAllContact`);
  }

  getCountLeads(): Observable<any> {
    return this.http.get(`${this.BASE_API_URL}/Filter/Count/GetAllLeads`);
  }

  getCountCountries(): Observable<any> {
    return this.http.get(
      `${this.BASE_API_URL}/Filter/Count/CountryHasContacts`
    );
  }

  getCountIndustries(): Observable<any> {
    return this.http.get(
      `${this.BASE_API_URL}/Filter/Count/ContactHasIndustry`
    );
  }
}
