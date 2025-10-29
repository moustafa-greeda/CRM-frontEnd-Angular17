import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  ICountry,
  ICity,
  IApiResponse,
} from '../../Models/common/country-city.models';

@Injectable({
  providedIn: 'root',
})
export class CountryCityService {
  private BASE_API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}
  /**
   * Get all countries from the API
   * @param pageSize Optional page size parameter
   * @returns Observable of countries response
   */
  getAllCountries(pageSize: number = 500): Observable<IApiResponse<ICountry>> {
    const params = new HttpParams().set('pageSize', pageSize.toString());

    return this.http.get<IApiResponse<ICountry>>(
      `${this.BASE_API_URL}/Client/GetAllCountries`,
      {
        params,
      }
    );
  }

  /**
   * Get cities by country ID
   * @param countryId The country ID to get cities for
   * @returns Observable of cities response
   */
  getCitiesByCountryId(countryId: number): Observable<IApiResponse<ICity>> {
    return this.http.get<IApiResponse<ICity>>(
      `${this.BASE_API_URL}/Client/GetCitiesByCountryId/${countryId}`
    );
  }

  /**
   * Get all cities (if endpoint exists)
   * @param pageSize Optional page size parameter
   * @returns Observable of cities response
   */
  getAllCities(pageSize: number = 500): Observable<IApiResponse<ICity>> {
    const params = new HttpParams().set('pageSize', pageSize.toString());

    return this.http.get<IApiResponse<ICity>>(
      `${this.BASE_API_URL}/Client/GetCitiesByCountryId`,
      {
        params,
      }
    );
  }

  /**
   * Search countries by name
   * @param searchTerm The search term
   * @returns Observable of filtered countries
   */
  searchCountries(searchTerm: string): Observable<IApiResponse<ICountry>> {
    const params = new HttpParams()
      .set('search', searchTerm)
      .set('pageSize', '100');

    return this.http.get<IApiResponse<ICountry>>(
      `${this.BASE_API_URL}/Filter/SearchCountries`,
      {
        params,
      }
    );
  }

  /**
   * Search cities by name and country
   * @param searchTerm The search term
   * @param countryId Optional country ID to filter by
   * @returns Observable of filtered cities
   */
  searchCities(
    searchTerm: string,
    countryId?: number
  ): Observable<IApiResponse<ICity>> {
    let params = new HttpParams()
      .set('search', searchTerm)
      .set('pageSize', '100');

    if (countryId) {
      params = params.set('countryId', countryId.toString());
    }

    return this.http.get<IApiResponse<ICity>>(
      `${this.BASE_API_URL}/Filter/SearchCities`,
      {
        params,
      }
    );
  }

  /**
   * Get country by ID
   * @param countryId The country ID
   * @returns Observable of country
   */
  getCountryById(countryId: number): Observable<ICountry> {
    return this.http.get<ICountry>(
      `${this.BASE_API_URL}/Filter/GetCountryById/${countryId}`
    );
  }

  /**
   * Get city by ID
   * @param cityId The city ID
   * @returns Observable of city
   */
  getCityById(cityId: number): Observable<ICity> {
    return this.http.get<ICity>(
      `${this.BASE_API_URL}/Filter/GetCityById/${cityId}`
    );
  }
}
