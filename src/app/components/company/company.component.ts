import { Component, OnInit, signal } from '@angular/core';
import { FormUiComponent } from '../../shared/components/form-ui/form-ui.component';
import { MatDialog } from '@angular/material/dialog';
import { ActionButton } from '../../shared/interfaces/action-button.interface';
import { COMPANY_FORM_CONFIG } from '../../shared/configs';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  ICompanyFilter,
  ICreateCompany,
} from '../../core/Models/common/icompanies';
import { GetAllCompaniseService } from '../../core/services/common/companise.service';
import { IIndustry } from '../../core/Models/common/iIndustry';
import { IndustryService } from '../../core/services/common/industry.service';
import { GetAllCompanySizeService } from '../../core/services/common/get-all-company-size.service';
import { GetAllCompanySatgeService } from '../../core/services/common/get-all-company-satge.service';
import { GetAllOwnerShipService } from '../../core/services/common/get-all-owner-ship.service';
import { CountryCityService } from '../../core/services/common/country-city.service';
import { NotifyDialogService } from '../../shared/components/notify-dialog-host/notify-dialog.service';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrl: './company.component.css',
})
export class CompanyComponent implements OnInit {
  constructor(
    private dialog: MatDialog,
    private _companiesService: GetAllCompaniseService,
    private _industryService: IndustryService,
    private _companySizeService: GetAllCompanySizeService,
    private _companyStageService: GetAllCompanySatgeService,
    private _ownerShipService: GetAllOwnerShipService,
    private _countryService: CountryCityService,
    private notify: NotifyDialogService,
    private http: HttpClient,
    private spinner: NgxSpinnerService
  ) {}

  pageTitle = 'ادارة الشركات';
  breadcrumb = [
    { label: 'الرئيسية', path: '/dashboard/admin' },
    { label: 'الشركات', path: '/dashboard/admin/company' },
  ];
  selectedCompanies: Set<number> = new Set();
  isAllSelected = false;
  totalCount = 0;
  // search form
  searchPlaceholder = 'ابحث عن شركة';
  lastSearchTerm: string = '';
  selectedCountry: string | null = null;
  selectedCity: string | null = null;
  countryOptions: string[] = [];
  cityOptions: string[] = [];
  companyFormConfig = { ...COMPANY_FORM_CONFIG };
  companyList$ = signal<ICompanyFilter[]>([]);
  isLoadingCompanies = false;
  pageIndex: number = 1;
  pageSize: number = 10;
  // derived flags for UI
  get hasActiveSearchTerm(): boolean {
    return !!this.lastSearchTerm && this.lastSearchTerm.trim().length > 0;
  }

  get hasNoCompanies(): boolean {
    return !this.isLoadingCompanies && this.companyList$().length === 0;
  }
  // variables
  industries: IIndustry[] = [];
  companySizes: any[] = [];
  companyStages: any[] = [];
  ownerships: any[] = [];
  cityList: any[] = [];
  countries: any[] = [];
  isLoadingFormData = true;
  countriesDb: any[] = [];
  countryPrefixMap: Map<number, string> = new Map();
  /** Action Buttons */
  actionButtons: ActionButton[] = [
    {
      label: 'إضافة شركة',
      iconClass: 'bi bi-plus',
      click: () => this.onAddCompany(),
    },
  ];

  ngOnInit(): void {
    this.loadAllInitialData();
    this.loadCompanies();
  }

  // =============================== load all initial data ========================
  loadAllInitialData(): void {
    // Show spinner
    this.spinner.show();

    // Load all data in parallel using forkJoin
    forkJoin({
      countriesDb: this.http
        .get<any[]>('assets/json/countriesdb.json')
        .pipe(catchError(() => of([]))),
      formData: forkJoin({
        industries: this._industryService
          .getAllIndustries()
          .pipe(catchError(() => of({ message: [] }))),
        companySizes: this._companySizeService
          .getAllCompanySizes()
          .pipe(catchError(() => of({ data: [] }))),
        companyStages: this._companyStageService
          .getAllCompanyStages()
          .pipe(catchError(() => of({ data: [] }))),
        ownerships: this._ownerShipService
          .GetAllOwnerShip()
          .pipe(catchError(() => of({ data: [] }))),
        countries: this._countryService
          .getAllCountries()
          .pipe(catchError(() => of({ data: [] }))),
      }),
    }).subscribe({
      next: (responses) => {
        // Load countries DB
        this.countriesDb = responses.countriesDb || [];

        // Load form data
        const formData = responses.formData;
        this.industries = formData.industries.message || [];
        this.companySizes = formData.companySizes.data || [];
        this.companyStages = formData.companyStages.data || [];
        this.ownerships = formData.ownerships.data || [];
        this.countries = formData.countries.data || [];
        // Prepare country options for filter dropdown (names only)
        this.countryOptions = this.countries.map((country) => country.name);

        // Update form options
        this.updateFieldOptions(
          'industeryId',
          this.industries.map((industry) => ({
            value: industry.id,
            label: industry.name,
          }))
        );
        this.updateFieldOptions(
          'companySizeId',
          this.companySizes.map((companySize) => ({
            value: companySize.id,
            label: companySize.sizeName,
          }))
        );
        this.updateFieldOptions(
          'companyStageId',
          this.companyStages.map((companyStage) => ({
            value: companyStage.id,
            label: companyStage.name,
          }))
        );
        this.updateFieldOptions(
          'ownershipId',
          this.ownerships.map((ownership) => ({
            value: ownership.id,
            label: ownership.type,
          }))
        );
        this.updateFieldOptions(
          'counteryId',
          this.countries.map((country) => ({
            value: country.id,
            label: country.name,
          }))
        );

        // Build country prefix map
        this.buildCountryPrefixMap();

        this.isLoadingFormData = false;
        // Hide spinner after all data is loaded
        this.spinner.hide();
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.isLoadingFormData = false;
        // Hide spinner on error
        this.spinner.hide();
      },
    });
  }

  // =============================== load companies ========================
  loadCompanies(filter?: ICompanyFilter): void {
    this.isLoadingCompanies = true;
    this._companiesService.getAllCompanyWithFilter(filter).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          const companies = response.data.items || [];
          this.companyList$.set(companies);
          this.totalCount = response.data.totalCount || 0;
          this.updateSelectAllState();
        } else {
          console.error('Failed to load companies:', response);
          this.companyList$.set([]);
          this.totalCount = 0;
        }
        this.isLoadingCompanies = false;
      },
      error: (error) => {
        console.error('Error loading companies:', error);
        this.companyList$.set([]);
        this.totalCount = 0;
        this.isLoadingCompanies = false;
      },
    });
  }

  // =============================== search & filter companies ========================
  onSearch(searchTerm: string): void {
    this.pageIndex = 1;
    this.lastSearchTerm = searchTerm || '';

    const filter: ICompanyFilter = {};

    // Apply search term
    if (this.lastSearchTerm) {
      filter.searchKeyword = this.lastSearchTerm;
    }

    // Apply selected country/city if available
    if (this.selectedCountry) {
      filter.countryName = this.selectedCountry;
    }
    if (this.selectedCity) {
      filter.cityName = this.selectedCity;
    }

    this.loadCompanies(filter);
  }

  // =============================== country method change ========================
  onCountryMethodChange(countryName: string): void {
    this.selectedCountry = countryName;

    // Find selected country by name to get its ID for cities API
    const selected = this.countries.find(
      (country) => country.name === countryName
    );
    if (selected?.id) {
      this.loadCitiesByCountryId(selected.id);

      // Trigger search using current filters (country + optional city + last search term)
      const filter: ICompanyFilter = {
        countryName: this.selectedCountry || undefined,
      };
      if (this.selectedCity) {
        filter.cityName = this.selectedCity;
      }
      if (this.lastSearchTerm) {
        filter.searchKeyword = this.lastSearchTerm;
      }
      this.loadCompanies(filter);
    } else {
      // If not found, clear cities
      this.loadCitiesByCountryId(0);
    }
  }

  // =============================== city method change ========================
  onCityChange(cityName: string): void {
    this.selectedCity = cityName;
    this.pageIndex = 1;
    // Trigger search using current filters (country + city + last search term)
    const filter: ICompanyFilter = {};
    if (this.selectedCountry) {
      filter.countryName = this.selectedCountry;
    }
    if (this.selectedCity) {
      filter.cityName = this.selectedCity;
    }
    if (this.lastSearchTerm) {
      filter.searchKeyword = this.lastSearchTerm;
    }
    this.loadCompanies(filter);
  }

  // =============================== reset filters ========================
  resetFilters(): void {
    this.selectedCountry = null;
    this.selectedCity = null;
    this.lastSearchTerm = '';
    this.pageIndex = 1;
    // Clear city options in dropdown
    this.cityOptions = [];
    // Clear cities in form config
    this.loadCitiesByCountryId(0);
    // Reload all companies without filters
    this.loadCompanies();
  }

  // =============================== load countries DB for phone prefixes ========================
  loadCountriesDb(): void {
    this.http.get<any[]>('assets/json/countriesdb.json').subscribe({
      next: (countries) => {
        this.countriesDb = countries;
        // Rebuild prefix map if countries are already loaded
        if (this.countries.length > 0) {
          this.buildCountryPrefixMap();
        }
      },
      error: (error) => {
        console.error('Error loading countries DB:', error);
      },
    });
  }

  // =============================== load all form data ========================
  loadAllFormData(): void {
    this.isLoadingFormData = true;

    forkJoin({
      industries: this._industryService.getAllIndustries().pipe(
        catchError((error) => {
          return of({ message: [] });
        })
      ),
      companySizes: this._companySizeService.getAllCompanySizes().pipe(
        catchError((error) => {
          return of({ data: [] });
        })
      ),
      companyStages: this._companyStageService.getAllCompanyStages().pipe(
        catchError((error) => {
          console.error('Error loading company stages:', error);
          return of({ data: [] });
        })
      ),
      ownerships: this._ownerShipService.GetAllOwnerShip().pipe(
        catchError((error) => {
          return of({ data: [] });
        })
      ),
      countries: this._countryService.getAllCountries().pipe(
        catchError((error) => {
          console.error('Error loading countries:', error);
          return of({ data: [] });
        })
      ),
    }).subscribe({
      next: (responses) => {
        // Update industries
        this.industries = responses.industries.message || [];
        this.updateFieldOptions(
          'industeryId',
          this.industries.map((industry) => ({
            value: industry.id,
            label: industry.name,
          }))
        );

        // Update company sizes
        this.companySizes = responses.companySizes.data || [];
        this.updateFieldOptions(
          'companySizeId',
          this.companySizes.map((companySize) => ({
            value: companySize.id,
            label: companySize.sizeName,
          }))
        );

        // Update company stages
        this.companyStages = responses.companyStages.data || [];
        this.updateFieldOptions(
          'companyStageId',
          this.companyStages.map((companyStage) => ({
            value: companyStage.id,
            label: companyStage.name,
          }))
        );

        // Update ownerships
        this.ownerships = responses.ownerships.data || [];
        this.updateFieldOptions(
          'ownershipId',
          this.ownerships.map((ownership) => ({
            value: ownership.id,
            label: ownership.type,
          }))
        );

        // Update countries
        this.countries = responses.countries.data || [];
        this.updateFieldOptions(
          'counteryId',
          this.countries.map((country) => ({
            value: country.id,
            label: country.name,
          }))
        );
        // Prepare country options for filter dropdown (names only)
        this.countryOptions = this.countries.map((country) => country.name);

        // Build country prefix map
        this.buildCountryPrefixMap();

        // Verify that all required data is loaded before allowing form to open
        const allDataLoaded =
          this.industries.length > 0 &&
          this.companySizes.length > 0 &&
          this.companyStages.length > 0 &&
          this.ownerships.length > 0 &&
          this.countries.length > 0;

        this.isLoadingFormData = false;
      },
      error: (error) => {
        console.error('Error loading form data:', error);
        this.isLoadingFormData = false;
      },
    });
  }

  // =============================== update field options helper ========================
  private updateFieldOptions(fieldName: string, options: any[]): void {
    const field = this.companyFormConfig.fields.find(
      (field) => field.name === fieldName
    );
    if (field) {
      field.options = options;
    }
  }

  // =============================== build country prefix map ========================
  private buildCountryPrefixMap(): void {
    this.countryPrefixMap.clear();

    this.countries.forEach((apiCountry) => {
      // Try to find matching country in JSON by name (English or Arabic)
      const matchedCountry = this.countriesDb.find(
        (jsonCountry) =>
          jsonCountry.name?.toLowerCase() === apiCountry.name?.toLowerCase() ||
          jsonCountry.ar_name?.toLowerCase() === apiCountry.name?.toLowerCase()
      );

      if (matchedCountry?.keyCode) {
        // Remove any non-digit characters except + and -
        const prefix = matchedCountry.keyCode.replace(/[^\d+\-]/g, '');
        this.countryPrefixMap.set(apiCountry.id, prefix);
      } else if (apiCountry.keyCode) {
        // Use keyCode from API if available
        const prefix = apiCountry.keyCode.replace(/[^\d+\-]/g, '');
        this.countryPrefixMap.set(apiCountry.id, prefix);
      }
    });
  }
  // =============================== set phone prefix ========================
  private setPhonePrefix(countryId: number, form: any): void {
    const prefix = this.countryPrefixMap.get(countryId);
    if (prefix) {
      const prefixField = form.get('phonePrefix');
      if (prefixField) {
        // Format prefix (ensure it starts with +)
        const formattedPrefix = prefix.startsWith('+') ? prefix : `+${prefix}`;
        prefixField.setValue(formattedPrefix, { emitEvent: false });
      }
    }
  }

  // =============================== clear phone prefix ========================
  private clearPhonePrefix(form: any): void {
    const prefixField = form.get('phonePrefix');
    if (prefixField) {
      prefixField.setValue('', { emitEvent: false });
    }
  }

  // ============================ get cities by country id ========================
  loadCitiesByCountryId(countryId: number): void {
    const cityField = this.companyFormConfig.fields.find(
      (field) => field.name === 'cityId'
    );

    if (!countryId) {
      // Clear city list when no country is selected
      this.cityList = [];
      this.cityOptions = [];
      if (cityField) {
        cityField.options = [];
        cityField.disabled = true; // Disable city field when no country is selected
        cityField.placeholder = 'يجب اختيار الدولة أولاً'; // Update placeholder
      }
      return;
    }

    this._countryService.getCitiesByCountryId(countryId).subscribe({
      next: (response) => {
        this.cityList = response.data || [];
        // Prepare city options (names) for filter dropdown
        this.cityOptions = this.cityList.map((city) => city.name);
        if (cityField) {
          cityField.options = this.cityList.map((city) => ({
            value: city.id,
            label: city.name,
          }));
          cityField.disabled = false; // Enable city field when country is selected
          cityField.placeholder = 'إختر المدينة'; // Reset placeholder to default
        }
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        this.cityList = [];
        if (cityField) {
          cityField.disabled = true; // Disable on error
          cityField.placeholder = 'يجب اختيار الدولة أولاً'; // Update placeholder on error
        }
      },
    });
  }

  // =============================== form company =========================

  onAddCompany() {
    // Don't open form if data is still loading
    if (this.isLoadingFormData) {
      console.warn('Form data is still loading, please wait...');
      return;
    }

    // Verify that all required dropdowns have options before opening form
    const hasAllOptions =
      this.industries.length > 0 &&
      this.companySizes.length > 0 &&
      this.companyStages.length > 0 &&
      this.ownerships.length > 0 &&
      this.countries.length > 0;

    if (!hasAllOptions) {
      this.notify.error({
        title: 'خطأ في تحميل البيانات',
        description:
          'لا يمكن فتح النموذج: بعض البيانات المطلوبة غير متوفرة. يرجى تحديث الصفحة والمحاولة مرة أخرى.',
      });
      return;
    }

    // Disable city field initially (no country selected)
    const cityField = this.companyFormConfig.fields.find(
      (field) => field.name === 'cityId'
    );
    if (cityField) {
      cityField.disabled = true;
      cityField.placeholder = 'يجب اختيار الدولة أولاً'; // Set initial placeholder
    }

    const dialogRef = this.dialog.open(FormUiComponent, {
      width: '80vw',
      maxWidth: '1000px',
      height: 'auto',
      maxHeight: '90vh',
      data: {
        config: this.companyFormConfig,
      },
      disableClose: true,
      panelClass: 'agreement-dialog',
      backdropClass: 'agreement-dialog-backdrop',
    });

    // Listen to submit event from FormUiComponent and only close on API success
    const componentInstance = dialogRef.componentInstance;
    componentInstance.formSubmit.subscribe((formData: any) => {
      this.createCompany(formData, dialogRef);
    });

    // Wait for form to be initialized
    setTimeout(() => {
      const form = componentInstance.form;
      if (form) {
        // Disable city field initially in the form
        const cityControl = form.get('cityId');
        if (cityControl) {
          cityControl.disable();
        }

        // Disable phone prefix field (it's always disabled)
        const prefixControl = form.get('phonePrefix');
        if (prefixControl) {
          prefixControl.disable();
        }

        // Watch for country changes
        form.get('counteryId')?.valueChanges.subscribe((countryId: any) => {
          if (countryId) {
            // Load cities for selected country
            this.loadCitiesByCountryId(Number(countryId));
            // Clear city selection when country changes
            form.get('cityId')?.setValue('', { emitEvent: false });
            // Enable city field when country is selected
            form.get('cityId')?.enable();

            // Set phone prefix automatically
            this.setPhonePrefix(Number(countryId), form);
          } else {
            // Clear cities when no country is selected
            this.loadCitiesByCountryId(0);
            form.get('cityId')?.setValue('', { emitEvent: false });
            // Disable city field when no country is selected
            form.get('cityId')?.disable();
            // Clear phone prefix
            this.clearPhonePrefix(form);
          }
        });
      }
    }, 200);

    // Keep afterClosed in case user cancels
    dialogRef.afterClosed().subscribe(() => {});
  }
  // =============================== create company ===================
  createCompany(formData: any, dialogRef?: any): void {
    // Combine phone prefix and phone number
    const phonePrefix = formData.phonePrefix || '';
    const phoneNumber = formData.phoneNumber || '';
    const fullPhoneNumber =
      phonePrefix && phoneNumber
        ? `${phonePrefix} ${phoneNumber}`
        : phoneNumber || phonePrefix;

    // Map form data to API payload (ICreateCompany)
    const payload: ICreateCompany = {
      name: formData.companyName || formData.name || '',
      industeryId: formData.industeryId ?? 0,
      companySizeId: formData.companySizeId ?? 0,
      companyStageId: formData.companyStageId ?? 0,
      ownershipId: formData.ownershipId ?? 0,
      cityId: formData.cityId ?? 0,
      counteryId: formData.counteryId ?? 0,
      addressLine: formData.location || formData.addressLine || '',
      email: formData.email || '',
      phoneNumber: fullPhoneNumber,
    };

    this._companiesService.createCompany(payload).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          // Reload companies list to get the updated data with all fields
          this.loadCompanies();

          this.notify.success({
            title: 'نجاح',
            description: 'تم إنشاء الشركة بنجاح',
          });
        } else {
          console.error(
            'Create company API returned succeeded: false',
            response
          );
        }

        // Close the dialog after API response
        dialogRef?.close();
      },
      error: (error) => {
        console.error('Error creating company:', error);
      },
    });
  }

  toggleDropdown(dropdown: any): void {
    dropdown.open = !dropdown.open;
  }

  selectOption(dropdown: any, option: any): void {
    dropdown.selected = option;
    dropdown.open = false;
  }

  trackByCompanyId(index: number, company: any): any {
    return company?.id || index;
  }

  // =============================== Selection Methods ===================
  onSelectAllChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isAllSelected = isChecked;

    if (isChecked) {
      // Select all companies
      this.companyList$().forEach((company: ICompanyFilter) => {
        if (company.id != null) {
          this.selectedCompanies.add(company.id);
        }
      });
    } else {
      // Deselect all companies
      this.selectedCompanies.clear();
    }
  }

  onCardSelectionChange(company: any, isSelected: boolean): void {
    if (isSelected) {
      this.selectedCompanies.add(company.id);
    } else {
      this.selectedCompanies.delete(company.id);
    }

    // Update select all checkbox state
    this.updateSelectAllState();
  }

  isCompanySelected(company: any): boolean {
    return company.id != null && this.selectedCompanies.has(company.id);
  }

  private updateSelectAllState(): void {
    const companyList = this.companyList$();
    this.isAllSelected =
      companyList.length > 0 &&
      companyList.every(
        (company: ICompanyFilter) =>
          company.id != null && this.selectedCompanies.has(company.id)
      );
  }
}
