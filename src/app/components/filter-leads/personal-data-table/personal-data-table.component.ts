import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PersonalData } from '../shared/interfaces';
import { PersonalServiceService } from './personal-service.service';

@Component({
  selector: 'app-personal-data-table',
  templateUrl: './personal-data-table.component.html',
  styleUrls: ['./personal-data-table.component.css']
})
export class PersonalDataTableComponent implements OnInit {
  @Input() data: PersonalData[] = [];
  @Output() filteredDataChange = new EventEmitter<PersonalData[]>();
  @Output() selectedRowsChange = new EventEmitter<PersonalData[]>();

  i = 1;
  filterForm!: FormGroup;
  filteredData$!: Observable<PersonalData[]>;
  selectedRows: PersonalData[] = [];
  isAllSelected = false;

  // Country and City data
  cities: any[] = [];
  countries: any[] = [];
  countryId!: number;

  // Filter button functionality
  showFilterButtons = true;
  selectedFilters: any[] = [];
  
  // Location dropdown visibility
  showCountryDropdown = false;
  showCityDropdown = false;
  availableFilters = [
    { id: 'personality', name: 'الشخصية', type: 'select', options: ['USER', 'ADMIN', 'MANAGER', 'EMPLOYEE'] },
    { id: 'customerLevel', name: 'مستوى العميل', type: 'select', options: ['NEW', 'EXISTING', 'VIP', 'PREMIUM'] },
    { id: 'customerType', name: 'نوع العميل', type: 'select', options: ['B2B', 'B2C', 'ENTERPRISE'] },
    { id: 'language', name: 'اللغة', type: 'select', options: ['العربية', 'English', 'Français'] },
    { id: 'department', name: 'القسم', type: 'select', options: ['IT', 'HR', 'Finance', 'Marketing', 'Sales'] },
    { id: 'age', name: 'العمر', type: 'select', options: ['18-25', '26-35', '36-45', '46-55', '55+'] },
    { id: 'jobTitle', name: 'المسمى الوظيفي', type: 'text', placeholder: 'أدخل المسمى الوظيفي' }
  ];

  // Filter options
  personalityOptions = ['USER', 'ADMIN', 'MANAGER', 'EMPLOYEE'];
  customerLevelOptions = ['NEW', 'EXISTING', 'VIP', 'PREMIUM'];
  customerTypeOptions = ['B2B', 'B2C', 'ENTERPRISE'];
  languageOptions = ['العربية', 'English', 'Français'];
  departmentOptions = ['IT', 'HR', 'Finance', 'Marketing', 'Sales'];
  ageRanges = [
    { label: '18-25', min: 18, max: 25 },
    { label: '26-35', min: 26, max: 35 },
    { label: '36-45', min: 36, max: 45 },
    { label: '46-55', min: 46, max: 55 },
    { label: '55+', min: 55, max: 100 }
  ];

  constructor(
    private fb: FormBuilder,
    private personalService: PersonalServiceService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.setupFiltering();
    this.getCountries();
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      personality: [''],
      customerLevel: [''],
      customerType: [''],
      language: [''],
      department: [''],
      ageRange: [''],
      jobTitle: ['']
    });
  }

  private setupFiltering(): void {
    this.filteredData$ = combineLatest([
      new BehaviorSubject(this.data),
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.value))
    ]).pipe(
      debounceTime(300),
      map(([data, filters]) => this.applyFilters(data, filters))
    );

    this.filteredData$.subscribe(filteredData => {
      this.filteredDataChange.emit(filteredData);
    });
  }

  private applyFilters(data: PersonalData[], filters: any): PersonalData[] {
    return data.filter(item => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableFields = [
          item.personality,
          item.customerLevel,
          item.customerType,
          item.language,
          item.department,
          item.jobTitle
        ];
        
        if (!searchableFields.some(field => 
          field?.toLowerCase().includes(searchTerm)
        )) {
          return false;
        }
      }

      // Individual filters
      if (filters.personality && item.personality !== filters.personality) return false;
      if (filters.customerLevel && item.customerLevel !== filters.customerLevel) return false;
      if (filters.customerType && item.customerType !== filters.customerType) return false;
      if (filters.language && item.language !== filters.language) return false;
      if (filters.department && item.department !== filters.department) return false;
      if (filters.jobTitle && !item.jobTitle.toLowerCase().includes(filters.jobTitle.toLowerCase())) return false;

      // Age range filter
      if (filters.ageRange) {
        const ageRange = this.ageRanges.find(range => range.label === filters.ageRange);
        if (ageRange && (item.age < ageRange.min || item.age > ageRange.max)) return false;
      }

      return true;
    });
  }

  onSelectAll(event: any): void {
    this.isAllSelected = event.checked;
    if (this.isAllSelected) {
      this.selectedRows = [...this.data];
    } else {
      this.selectedRows = [];
    }
    this.selectedRowsChange.emit(this.selectedRows);
  }

  onSelectRow(row: PersonalData, event: any): void {
    if (event.checked) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows = this.selectedRows.filter(item => item.id !== row.id);
    }
    this.isAllSelected = this.selectedRows.length === this.data.length;
    this.selectedRowsChange.emit(this.selectedRows);
  }

  isRowSelected(row: PersonalData): boolean {
    return this.selectedRows.some(item => item.id === row.id);
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  getActiveFiltersCount(): number {
    const formValue = this.filterForm.value;
    return Object.values(formValue).filter(value => value && value !== '').length;
  }

  toggleFilterButtons(): void {
    this.showFilterButtons = !this.showFilterButtons;
  }

  addFilter(filterId: string) {
    const filter = this.availableFilters.find(f => f.id === filterId);
    if (filter && !this.selectedFilters.find(f => f.id === filterId)) {
      this.selectedFilters.push({
        ...filter,
        value: '',
        isActive: true
      });
    }
    // this.showFilterButtons = false;
  }

  removeFilter(filterId: string) {
    this.selectedFilters = this.selectedFilters.filter(f => f.id !== filterId);
  }

  isFilterSelected(filterId: string): boolean {
    return !!this.selectedFilters.find(f => f.id === filterId);
  }

  onSelectChange(filterId: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.onFilterChange(filterId, target.value);
  }

  onInputChange(filterId: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    this.onFilterChange(filterId, target.value);
  }

  onFilterChange(filterId: string, value: any) {
    const filter = this.selectedFilters.find(f => f.id === filterId);
    if (filter) {
      filter.value = value;
    }
  }

  clearAllFilters() {
    this.selectedFilters = [];
    this.showCountryDropdown = false;
    this.showCityDropdown = false;
    this.countryId = 0;
    this.cities = [];
    this.filterForm.reset();
  }

  hasActiveFilters(): boolean {
    return this.selectedFilters.length > 0 || this.showCountryDropdown || this.showCityDropdown;
  }

  executeFilters() {
    // Apply country filter
    if (this.showCountryDropdown && this.countryId) {
      const selectedCountry = this.countries.find(c => c.id == this.countryId);
      if (selectedCountry) {
        this.filterForm.patchValue({ country: selectedCountry.name });
      }
    }

    // Apply city filter
    if (this.showCityDropdown && this.cities.length > 0) {
      const citySelect = document.querySelector('.city-dropdown') as HTMLSelectElement;
      if (citySelect && citySelect.value) {
        const selectedCity = this.cities.find(c => c.id == citySelect.value);
        if (selectedCity) {
          this.filterForm.patchValue({ city: selectedCity.name });
        }
      }
    }

    // Apply other selected filters
    this.selectedFilters.forEach(filter => {
      if (filter.value) {
        this.filterForm.patchValue({ [filter.id]: filter.value });
      }
    });

    // Trigger filtering
    this.setupFiltering();
  }

  // Country and City methods
  getCountries() {
    this.personalService.getAllCountries().subscribe({
      next: (res) => {
        if (res.data) {
          this.countries = res.data;
          console.log('Countries loaded in personal table:', this.countries);
        }   
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        this.countries = [];
      }
    });
  }

  onCountryChange(event: any) {
    this.countryId = event.target.value;
    if (this.countryId) {
      this.personalService.getCitiesByCountryId(this.countryId).subscribe({
        next: (res) => {
          this.cities = res.data || [];
          console.log('Cities loaded in personal table:', this.cities);
        },
        error: (error) => {
          console.error('Error loading cities:', error);
          this.cities = [];
        }
      });
    } else {
      this.cities = [];
    }
  }

  onCityChange(event: any) {
    const cityId = event.target.value;
    console.log('Selected city ID:', cityId);
    // You can add city filtering logic here if needed
  }

  // Toggle methods for location dropdowns
  toggleCountryDropdown() {
    this.showCountryDropdown = !this.showCountryDropdown;
    // Keep country dropdown open when city dropdown is opened
  }

  toggleCityDropdown() {
    if (this.countryId) {
      this.showCityDropdown = !this.showCityDropdown;
      // Keep both dropdowns open - don't close country dropdown
    }
  }
}
