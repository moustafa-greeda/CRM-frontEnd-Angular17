# Country-City Service

A dedicated Angular service for managing country and city data operations.

## Overview

The `CountryCityService` provides a centralized way to handle all country and city related API calls, with proper TypeScript interfaces and error handling.

## Features

- ✅ Get all countries
- ✅ Get cities by country ID
- ✅ Search countries by name
- ✅ Search cities by name and country
- ✅ Get individual country/city by ID
- ✅ Proper TypeScript interfaces
- ✅ Error handling
- ✅ Authentication headers
- ✅ Pagination support

## Usage

### 1. Import the Service

```typescript
import { CountryCityService } from '../../core/services/country-city.service';
import { ICountry, ICity } from '../../core/models/country-city.models';
```

### 2. Inject in Constructor

```typescript
constructor(private countryCityService: CountryCityService) {}
```

### 3. Use Service Methods

```typescript
// Get all countries
this.countryCityService.getAllCountries().subscribe({
  next: (response) => {
    this.countries = response.data;
  },
  error: (error) => {
    console.error('Error loading countries:', error);
  }
});

// Get cities by country
this.countryCityService.getCitiesByCountryId(countryId).subscribe({
  next: (response) => {
    this.cities = response.data;
  },
  error: (error) => {
    console.error('Error loading cities:', error);
  }
});
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `getAllCountries()` | `/Filter/GetAllCountries` | Get all countries with pagination |
| `getCitiesByCountryId(id)` | `/Filter/GetCitiesByCountryId/{id}` | Get cities for specific country |
| `getAllCities()` | `/Filter/GetAllCities` | Get all cities with pagination |
| `searchCountries(term)` | `/Filter/SearchCountries` | Search countries by name |
| `searchCities(term, countryId?)` | `/Filter/SearchCities` | Search cities by name and country |
| `getCountryById(id)` | `/Filter/GetCountryById/{id}` | Get specific country |
| `getCityById(id)` | `/Filter/GetCityById/{id}` | Get specific city |

## Data Models

### ICountry
```typescript
interface ICountry {
  id: number;
  name: string;
  code?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

### ICity
```typescript
interface ICity {
  id: number;
  name: string;
  countryId: number;
  countryName?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

### IApiResponse
```typescript
interface IApiResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  success: boolean;
  message?: string;
}
```

## Error Handling

All service methods include proper error handling. Always subscribe with both `next` and `error` callbacks:

```typescript
this.countryCityService.getAllCountries().subscribe({
  next: (response) => {
    // Handle success
    this.countries = response.data;
  },
  error: (error) => {
    // Handle error
    console.error('Error:', error);
    this.countries = [];
  }
});
```

## Authentication

The service automatically includes authentication headers if a token is available in localStorage.

## Examples

See `country-city.service.example.ts` for complete usage examples.

## Integration with Filter Leads

The service is already integrated with the Filter Leads component:

```typescript
// In filter-leads.component.ts
constructor(
  private _FilterLeadsService: FilterLeadsService,
  private _CountryCityService: CountryCityService,
  private cdr: ChangeDetectorRef
) {}

getCountries() {
  this._CountryCityService.getAllCountries().subscribe({
    next: (res) => {
      if (res.data) {
        this.countries = res.data;
      }   
    },
    error: (error) => {
      console.error('Error loading countries:', error);
      this.countries = [];
    }
  });
}
```
