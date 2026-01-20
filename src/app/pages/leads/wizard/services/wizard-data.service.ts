import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CountryCityService } from '../../../../core/services/common/country-city.service';
import { JobLevelService } from '../../../../core/services/common/job-level.service';

@Injectable({
  providedIn: 'root',
})
export class WizardDataService {
  // Signals for reactive state management
  private jobLevels = signal<any[]>([]);
  private countries = signal<any[]>([]);
  private cities = signal<any[]>([]);

  // Public readonly signals
  readonly jobLevels$ = this.jobLevels.asReadonly();
  readonly countries$ = this.countries.asReadonly();
  readonly cities$ = this.cities.asReadonly();

  constructor(
    private countryCityService: CountryCityService,
    private jobLevelService: JobLevelService
  ) {}

  /**
   * Load job levels from service
   */
  loadJobLevels(): Observable<any[]> {
    return this.jobLevelService.getAllJobLevels().pipe(
      map((response) => {
        const levels = response.data || [];
        this.jobLevels.set(levels);
        return levels;
      }),
      catchError(() => {
        this.jobLevels.set([]);
        return of([]);
      })
    );
  }

  /**
   * Load countries from service
   */
  loadCountries(): Observable<any[]> {
    return this.countryCityService.getAllCountries().pipe(
      map((response) => {
        const countries = response.data || [];
        this.countries.set(countries);
        return countries;
      }),
      catchError(() => {
        this.countries.set([]);
        return of([]);
      })
    );
  }

  /**
   * Load cities by country ID
   */
  loadCitiesByCountryId(countryId: number): Observable<any[]> {
    return this.countryCityService.getCitiesByCountryId(countryId).pipe(
      map((response) => {
        const cities = response.data || [];
        this.cities.set(cities);
        return cities;
      }),
      catchError(() => {
        this.cities.set([]);
        return of([]);
      })
    );
  }

  /**
   * Clear cities (useful when country changes)
   */
  clearCities(): void {
    this.cities.set([]);
  }

  /**
   * Get current job levels
   */
  getCurrentJobLevels(): any[] {
    return this.jobLevels();
  }

  /**
   * Get current countries
   */
  getCurrentCountries(): any[] {
    return this.countries();
  }

  /**
   * Get current cities
   */
  getCurrentCities(): any[] {
    return this.cities();
  }

  /**
   * Helper method to get job level ID
   */
  getJobLevelId(jobLevelValue: any): number {
    if (!jobLevelValue) return 0;

    // If it's already a number, return it
    if (typeof jobLevelValue === 'number') {
      return jobLevelValue;
    }

    // If it's a string that can be converted to number, convert it
    const numericValue = Number(jobLevelValue);
    if (!isNaN(numericValue)) {
      return numericValue;
    }

    // If it's a string (job level name), search for it in the loaded job levels
    if (typeof jobLevelValue === 'string') {
      const foundJobLevel = this.jobLevels().find(
        (level) => level.name?.toLowerCase() === jobLevelValue.toLowerCase()
      );
      if (foundJobLevel && foundJobLevel.id) {
        return foundJobLevel.id;
      }
    }

    // Fallback to 0 if not found
    return 0;
  }

  /**
   * Helper method to get countryId from value
   */
  getCountryIdFromService(countryValue: any): number {
    if (!countryValue) return 0;

    // If it's already a number, return it
    if (typeof countryValue === 'number') {
      return countryValue;
    }

    // If it's a string that can be converted to number, convert it
    const numericValue = Number(countryValue);
    if (!isNaN(numericValue)) {
      return numericValue;
    }

    // If it's a string (country name), we would need to search for it
    // For now, return 0 as fallback
    return 0;
  }

  /**
   * Helper method to get cityId from value
   */
  getCityIdFromService(cityValue: any): number {
    if (!cityValue) return 0;

    // If it's already a number, return it
    if (typeof cityValue === 'number') {
      return cityValue;
    }

    // If it's a string that can be converted to number, convert it
    const numericValue = Number(cityValue);
    if (!isNaN(numericValue)) {
      return numericValue;
    }

    // If it's a string (city name), we would need to search for it
    // For now, return 0 as fallback
    return 0;
  }
}
