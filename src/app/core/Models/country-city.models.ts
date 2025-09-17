export interface ICountry {
  id: number;
  name: string;
  code?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICity {
  id: number;
  name: string;
  countryId: number;
  countryName?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IApiResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  success: boolean;
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
