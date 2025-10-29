export interface ICountry {
  id: number;
  name: string;
  keyCode?: string;
  citiesCount?: string;
  isoCode?: string;
}

export interface ICity {
  id: number;
  name: string;
  countryId: number;
}

export interface IApiResponse<T> {
  succeeded: boolean;
  data: T[];
  warningErrors?: string[] | null;
  validationErrors?: string[];
  message?: string;
}

export interface ICountryCityFilter {
  searchTerm?: string;
  countryId?: number;
  cityId?: number;
  isActive?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface ICountryCitySearchResult {
  countries: ICountry[];
  cities: ICity[];
  totalCount: number;
}
