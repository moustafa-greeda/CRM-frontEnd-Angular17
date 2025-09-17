/**
 * Example usage of CountryCityService
 * This file demonstrates how to use the CountryCityService in your components
 */

import { Component, OnInit } from '@angular/core';
import { CountryCityService } from './country-city.service';
import { ICountry, ICity, IApiResponse } from '../models/country-city.models';

@Component({
  selector: 'app-example',
  template: `
    <div>
      <h3>Countries</h3>
      <select (change)="onCountryChange($event)">
        <option value="">Select Country</option>
        <option *ngFor="let country of countries" [value]="country.id">
          {{ country.name }}
        </option>
      </select>

      <h3>Cities</h3>
      <select>
        <option value="">Select City</option>
        <option *ngFor="let city of cities" [value]="city.id">
          {{ city.name }}
        </option>
      </select>
    </div>
  `
})
export class ExampleComponent implements OnInit {
  countries: ICountry[] = [];
  cities: ICity[] = [];
  selectedCountryId: number | null = null;

  constructor(private countryCityService: CountryCityService) {}

  ngOnInit() {
    this.loadCountries();
  }

  loadCountries() {
    this.countryCityService.getAllCountries().subscribe({
      next: (response: IApiResponse<ICountry>) => {
        this.countries = response.data;
        console.log('Countries loaded:', this.countries);
      },
      error: (error) => {
        console.error('Error loading countries:', error);
      }
    });
  }

  onCountryChange(event: any) {
    const countryId = parseInt(event.target.value);
    if (countryId) {
      this.selectedCountryId = countryId;
      this.loadCitiesByCountry(countryId);
    } else {
      this.cities = [];
      this.selectedCountryId = null;
    }
  }

  loadCitiesByCountry(countryId: number) {
    this.countryCityService.getCitiesByCountryId(countryId).subscribe({
      next: (response: IApiResponse<ICity>) => {
        this.cities = response.data;
        console.log('Cities loaded:', this.cities);
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        this.cities = [];
      }
    });
  }

  searchCountries(searchTerm: string) {
    if (searchTerm.length > 2) {
      this.countryCityService.searchCountries(searchTerm).subscribe({
        next: (response: IApiResponse<ICountry>) => {
          this.countries = response.data;
        },
        error: (error) => {
          console.error('Error searching countries:', error);
        }
      });
    }
  }

  searchCities(searchTerm: string) {
    if (searchTerm.length > 2) {
      this.countryCityService.searchCities(searchTerm, this.selectedCountryId || undefined).subscribe({
        next: (response: IApiResponse<ICity>) => {
          this.cities = response.data;
        },
        error: (error) => {
          console.error('Error searching cities:', error);
        }
      });
    }
  }
}
