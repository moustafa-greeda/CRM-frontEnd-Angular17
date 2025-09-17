import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonalServiceService {

  private BASE_API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  getCitiesByCountryId(id: number): Observable<any> {
    return this.http.get(`${this.BASE_API_URL}/Filter/GetCitiesByCountryId/${id}`);
  }


  // Get all countries from the correct API endpoint
  getAllCountries(): Observable<any> {
    return this.http.get(`${this.BASE_API_URL}/Filter/GetAllCountries`);
  }
}
