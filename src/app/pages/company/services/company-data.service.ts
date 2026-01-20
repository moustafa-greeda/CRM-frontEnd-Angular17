import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { GetAllCompaniseService } from '../../../core/services/common/companise.service';
import { IndustryService } from '../../../core/services/common/industry.service';
import { GetAllCompanySizeService } from '../../../core/services/common/get-all-company-size.service';
import { GetAllCompanySatgeService } from '../../../core/services/common/get-all-company-satge.service';
import { GetAllOwnerShipService } from '../../../core/services/common/get-all-owner-ship.service';
import { CountryCityService } from '../../../core/services/common/country-city.service';
import { ICompanyFilter } from '../../../core/Models/common/icompanies';
import { IIndustry } from '../../../core/Models/common/iIndustry';

export interface InitialData {
  countriesDb: any[];
  industries: IIndustry[];
  companySizes: any[];
  companyStages: any[];
  ownerships: any[];
  countries: any[];
  countryOptions: string[];
  countryPrefixMap: Map<number, string>;
}

export interface CompanyListResponse {
  companies: ICompanyFilter[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class CompanyDataService {
  // Signals for reactive state management
  private countriesDb = signal<any[]>([]);
  private industries = signal<IIndustry[]>([]);
  private companySizes = signal<any[]>([]);
  private companyStages = signal<any[]>([]);
  private ownerships = signal<any[]>([]);
  private countries = signal<any[]>([]);
  private countryPrefixMap = signal<Map<number, string>>(new Map());
  private cities = signal<any[]>([]);

  // Public computed signals
  readonly countriesDb$ = this.countriesDb.asReadonly();
  readonly industries$ = this.industries.asReadonly();
  readonly companySizes$ = this.companySizes.asReadonly();
  readonly companyStages$ = this.companyStages.asReadonly();
  readonly ownerships$ = this.ownerships.asReadonly();
  readonly countries$ = this.countries.asReadonly();
  readonly countryPrefixMap$ = this.countryPrefixMap.asReadonly();
  readonly cities$ = this.cities.asReadonly();

  // Computed signals for derived data
  readonly countryOptions = computed(() =>
    this.countries().map((country) => country.name)
  );

  readonly cityOptions = computed(() => this.cities().map((city) => city.name));

  constructor(
    private http: HttpClient,
    private companiesService: GetAllCompaniseService,
    private industryService: IndustryService,
    private companySizeService: GetAllCompanySizeService,
    private companyStageService: GetAllCompanySatgeService,
    private ownerShipService: GetAllOwnerShipService,
    private countryService: CountryCityService
  ) {}

  loadAllInitialData(): Observable<InitialData> {
    return forkJoin({
      countriesDb: this.http
        .get<any[]>('assets/json/countriesdb.json')
        .pipe(catchError(() => of([]))),
      formData: forkJoin({
        industries: this.industryService
          .getAllIndustries()
          .pipe(catchError(() => of({ message: [] }))),
        companySizes: this.companySizeService
          .getAllCompanySizes()
          .pipe(catchError(() => of({ data: [] }))),
        companyStages: this.companyStageService
          .getAllCompanyStages()
          .pipe(catchError(() => of({ data: [] }))),
        ownerships: this.ownerShipService
          .GetAllOwnerShip()
          .pipe(catchError(() => of({ data: [] }))),
        countries: this.countryService
          .getAllCountries()
          .pipe(catchError(() => of({ data: [] }))),
      }),
    }).pipe(
      tap((responses) => {
        // Update signals
        this.countriesDb.set(responses.countriesDb || []);
        const formData = responses.formData;

        const industries = formData.industries.message || [];
        const companySizes = formData.companySizes.data || [];
        const companyStages = formData.companyStages.data || [];
        const ownerships = formData.ownerships.data || [];
        const countries = formData.countries.data || [];

        this.industries.set(industries);
        this.companySizes.set(companySizes);
        this.companyStages.set(companyStages);
        this.ownerships.set(ownerships);
        this.countries.set(countries);

        // Build and set country prefix map
        const prefixMap = this.buildCountryPrefixMap(
          countries,
          responses.countriesDb || []
        );
        this.countryPrefixMap.set(prefixMap);
      }),
      map((responses) => {
        const formData = responses.formData;

        const industries = formData.industries.message || [];
        const companySizes = formData.companySizes.data || [];
        const companyStages = formData.companyStages.data || [];
        const ownerships = formData.ownerships.data || [];
        const countries = formData.countries.data || [];

        const countryOptions = countries.map((country) => country.name);
        const countryPrefixMap = this.countryPrefixMap();

        return {
          countriesDb: responses.countriesDb || [],
          industries,
          companySizes,
          companyStages,
          ownerships,
          countries,
          countryOptions,
          countryPrefixMap,
        };
      })
    );
  }

  loadCompanies(filter: ICompanyFilter): Observable<CompanyListResponse> {
    return this.companiesService.getAllCompanyWithFilter(filter).pipe(
      map((response) => {
        if (response.succeeded && response.data) {
          return {
            companies: response.data.items || [],
            totalCount: Number(response.data.totalCount) || 0,
          };
        }
        return { companies: [], totalCount: 0 };
      }),
      catchError(() => of({ companies: [], totalCount: 0 }))
    );
  }

  loadCitiesByCountryId(countryId: number): Observable<any[]> {
    if (!countryId) {
      this.cities.set([]);
      return of([]);
    }

    return this.countryService.getCitiesByCountryId(countryId).pipe(
      tap((response) => {
        const cities = response.data || [];
        this.cities.set(cities);
      }),
      map((response) => response.data || []),
      catchError(() => {
        this.cities.set([]);
        return of([]);
      })
    );
  }

  // Clear cities when country is deselected
  clearCities(): void {
    this.cities.set([]);
  }

  private buildCountryPrefixMap(
    countries: any[],
    countriesDb: any[]
  ): Map<number, string> {
    const map = new Map<number, string>();

    countries.forEach((apiCountry) => {
      const matchedCountry = countriesDb.find(
        (jsonCountry) =>
          jsonCountry.name?.toLowerCase() === apiCountry.name?.toLowerCase() ||
          jsonCountry.ar_name?.toLowerCase() === apiCountry.name?.toLowerCase()
      );

      if (matchedCountry?.keyCode) {
        const prefix = matchedCountry.keyCode.replace(/[^\d+\-]/g, '');
        map.set(apiCountry.id, prefix);
      } else if (apiCountry.keyCode) {
        const prefix = apiCountry.keyCode.replace(/[^\d+\-]/g, '');
        map.set(apiCountry.id, prefix);
      }
    });

    return map;
  }

  getPhonePrefix(countryId: number): string {
    const prefix = this.countryPrefixMap().get(countryId);
    if (prefix) {
      return prefix.startsWith('+') ? prefix : `+${prefix}`;
    }
    return '';
  }

  // Get current values from signals
  getCurrentIndustries(): IIndustry[] {
    return this.industries();
  }

  getCurrentCompanySizes(): any[] {
    return this.companySizes();
  }

  getCurrentCompanyStages(): any[] {
    return this.companyStages();
  }

  getCurrentOwnerships(): any[] {
    return this.ownerships();
  }

  getCurrentCountries(): any[] {
    return this.countries();
  }

  getCurrentCities(): any[] {
    return this.cities();
  }

  getCurrentCountryPrefixMap(): Map<number, string> {
    return this.countryPrefixMap();
  }
}
