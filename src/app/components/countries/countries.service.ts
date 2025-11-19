import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IApiResponse, ICountry } from '../../core/Models/common/icountry';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  private BASE_API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Get headers with authorization token
   */
  private getHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Get countries from local JSON file (assets/json/countriesdb.json)
   */
  getCountriesFromJSON(): Observable<ICountry[]> {
    return this.http.get<ICountry[]>('assets/json/countriesdb.json');
  }

  /**
   * Get countries from database (API)
   */
  getCountriesFromAPI(): Observable<IApiResponse> {
    return this.http.get<IApiResponse>(`${this.BASE_API_URL}/Country`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Add new country (POST to API)
   */
  addCountry(country: ICountry): Observable<any> {
    return this.http.post(`${this.BASE_API_URL}/Country/save`, country, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Update existing country (same endpoint as add in your Swagger)
   */
  updateCountry(country: ICountry): Observable<any> {
    return this.http.post(`${this.BASE_API_URL}/Country/save`, country, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Delete country by id
   */
  deleteCountry(id: number): Observable<any> {
    return this.http.delete(`${this.BASE_API_URL}/Country/${id}`, {
      headers: this.getHeaders(),
    });
  }

  //  Merge data from JSON and API (optional, can be extended)
  getCountries(): Observable<ICountry[]> {
    return new Observable<ICountry[]>((observer) => {
      this.getCountriesFromJSON().subscribe({
        next: (jsonData) => {
          this.getCountriesFromAPI().subscribe({
            next: (apiResponse: IApiResponse) => {
              const apiData = apiResponse.data?.items || [];
              // دمج الـ jsonData مع apiData
              const combinedData = [...jsonData, ...apiData];
              observer.next(combinedData);
              observer.complete();
            },
            error: (apiError) => {
              console.error('API Error, using JSON data only:', apiError);
              observer.next(jsonData);
              observer.complete();
            },
          });
        },
        error: (jsonError) => {
          console.error('JSON Error:', jsonError);
          // Try to get data from API only
          this.getCountriesFromAPI().subscribe({
            next: (apiResponse: IApiResponse) => {
              const apiData = apiResponse.data?.items || [];
              observer.next(apiData);
              observer.complete();
            },
            error: (apiError) => {
              console.error('Both JSON and API failed:', apiError);
              observer.next([]);
              observer.complete();
            },
          });
        },
      });
    });
  }
}
