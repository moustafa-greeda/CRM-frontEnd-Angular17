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
  totalCount = 0;
  viewMode: 'card' | 'table' = 'card';

  // Computed property for total pages
  get totalPages(): number {
    const pages = Math.ceil(this.totalCount / this.pageSize);
    // Ensure at least 1 page if there's any data
    return pages > 0 ? pages : 0;
  }

  // Computed property for current page (1-based for pagination component)
  get currentPage(): number {
    return this.pageIndex;
  }

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
        this.isLoadingFormData = false;
        // Hide spinner on error
        this.spinner.hide();
      },
    });
  }

  // =============================== load companies ========================
  loadCompanies(filter?: ICompanyFilter): void {
    this.isLoadingCompanies = true;

    // Add pagination parameters to filter
    const filterWithPagination: ICompanyFilter = {
      ...filter,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
    };

    this._companiesService
      .getAllCompanyWithFilter(filterWithPagination)
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            const companies = response.data.items || [];
            this.companyList$.set(companies);
            // Ensure totalCount is a number
            this.totalCount = Number(response.data.totalCount) || 0;
            this.updateSelectAllState();
          } else {
            this.companyList$.set([]);
            this.totalCount = 0;
          }
          this.isLoadingCompanies = false;
        },
        error: (error) => {
          this.companyList$.set([]);
          this.totalCount = 0;
          this.isLoadingCompanies = false;
        },
      });
  }

  // =============================== on page size change ========================
  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.pageIndex = 1;
    this.loadCompanies();
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

  // =============================== pagination ========================
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.pageIndex) {
      this.pageIndex = page;

      // Build filter with current search criteria
      const filter: ICompanyFilter = {};

      if (this.lastSearchTerm) {
        filter.searchKeyword = this.lastSearchTerm;
      }

      if (this.selectedCountry) {
        filter.countryName = this.selectedCountry;
      }

      if (this.selectedCity) {
        filter.cityName = this.selectedCity;
      }

      // Load companies with new page
      this.loadCompanies(filter);
    }
  }

  // Wrapper method to handle pageChange event from pagination component
  handlePageChange(event: any): void {
    this.onPageChange(event as number);
  }

  // =============================== table handlers ========================
  // Handlers for reusable table component
  onTablePage(event: any): void {
    // MatPaginator PageEvent: pageIndex is 0-based
    const newPage = (event?.pageIndex ?? 0) + 1;
    if (newPage !== this.pageIndex) {
      this.pageIndex = newPage;
    }
    if (event?.pageSize && event.pageSize !== this.pageSize) {
      this.pageSize = event.pageSize;
    }
    this.loadCompanies();
  }

  onTablePageSize(newSize: number): void {
    if (newSize && newSize !== this.pageSize) {
      this.pageSize = newSize;
      this.pageIndex = 1;
      this.loadCompanies();
    }
  }

  onViewClient(company: ICompanyFilter): void {
    // For now, view and edit are the same - open the form
    this.onEditCompany(company);
  }

  onEditClient(company: ICompanyFilter): void {
    this.onEditCompany(company);
  }

  onDeleteClient(company: ICompanyFilter): void {
    // TODO: Implement delete functionality
    this.notify.error({
      title: 'تنبيه',
      description: 'حذف الشركة غير متاح حالياً.',
    });
  }

  /**
   * Table columns configuration for companies
   */
  get tableColumns(): {
    key: string;
    header: string;
    width?: string;
    formatter?: 'date' | 'datetime' | 'booleanYesNo';
  }[] {
    return [
      { key: 'name', header: 'اسم الشركة' },
      { key: 'email', header: 'البريد الإلكتروني' },
      { key: 'phoneNumber', header: 'رقم الهاتف' },
      { key: 'industeryName', header: 'الصناعة' },
      { key: 'ownershipId', header: 'الملكية' },
      { key: 'companySizeId', header: 'حجم الشركة' },
      { key: 'comapanyStageId', header: 'المرحلة' },
      { key: 'countryName', header: 'الدولة' },
      { key: 'cityName', header: 'المدينة' },
      { key: 'addressLine', header: 'العنوان' },
    ];
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
        // Error loading countries DB
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
        this.isLoadingFormData = false;
      },
    });
  }

  // =============================== update field options helper ========================
  private updateFieldOptions(
    fieldName: string,
    options: any[],
    defaultLabel?: string
  ): void {
    const field = this.companyFormConfig.fields.find(
      (field) => field.name === fieldName
    );
    if (field) {
      // Get default label from placeholder or use provided label
      // const defaultOptionLabel = defaultLabel || field.placeholder || 'اختر...';

      // Add default option at the beginning
      const optionsWithDefault = [
        // { value: '', label: defaultOptionLabel },
        ...options,
      ];

      field.options = optionsWithDefault;
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
    // get cities by country id
    this._countryService.getCitiesByCountryId(countryId).subscribe({
      next: (response) => {
        this.cityList = response.data || [];
        // Prepare city options (names) for filter dropdown
        this.cityOptions = this.cityList.map((city) => city.name);
        if (cityField) {
          // Add default option at the beginning
          const cityOptions = [
            // { value: '', label: cityField.placeholder || 'إختر المدينة' },
            ...this.cityList.map((city) => ({
              value: city.id,
              label: city.name,
            })),
          ];
          cityField.options = cityOptions;
          cityField.disabled = false; // Enable city field when country is selected
          cityField.placeholder = 'إختر المدينة'; // Reset placeholder to default
        }
      },
      error: (error) => {
        this.cityList = [];
        if (cityField) {
          cityField.disabled = true; // Disable on error
          cityField.placeholder = 'يجب اختيار الدولة أولاً'; // Update placeholder on error
        }
      },
    });
  }

  // =============================== form company (unified create/edit) =========================
  /**
   * Opens company form for create or edit
   * @param company Optional company data for edit mode. If not provided, opens in create mode.
   */
  openCompanyForm(company?: ICompanyFilter): void {
    // Don't open form if data is still loading
    if (this.isLoadingFormData) {
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

    // Determine if this is edit or create mode
    const isEditMode = !!company && !!company.id;

    // Prepare form config
    const formConfig = {
      ...this.companyFormConfig,
      title: isEditMode ? 'تعديل شركة' : 'إضافة شركة جديدة',
    };

    // Prepare initial data
    let initialData: Record<string, any> | undefined;

    if (isEditMode && company) {
      // Map company data to form initial data
      initialData = this.mapCompanyToFormData(company);

      // Load cities for the selected country if country is available
      if (initialData['counteryId']) {
        this.loadCitiesByCountryId(initialData['counteryId']);
      }
    } else {
      // Disable city field initially (no country selected) for create mode
      const cityField = formConfig.fields.find(
        (field) => field.name === 'cityId'
      );
      if (cityField) {
        cityField.disabled = true;
        cityField.placeholder = 'يجب اختيار الدولة أولاً';
      }
    }

    // Function to open dialog after cities are loaded (if needed)
    const openDialog = () => {
      // Update cityId in initialData if city was found (for edit mode)
      if (
        isEditMode &&
        company &&
        initialData &&
        company.cityName &&
        initialData['counteryId']
      ) {
        const city = this.cityList.find(
          (city) => city.name === company.cityName
        );
        if (city) {
          initialData['cityId'] = city.id;
        }
      }

      const dialogRef = this.dialog.open(FormUiComponent, {
        width: '80vw',
        maxWidth: '1000px',
        height: 'auto',
        maxHeight: '90vh',
        data: {
          config: formConfig,
          ...(initialData && { initialData }),
        },
        disableClose: true,
        panelClass: 'agreement-dialog',
        backdropClass: 'agreement-dialog-backdrop',
      });

      // Listen to submit event from FormUiComponent
      const componentInstance = dialogRef.componentInstance;
      componentInstance.formSubmit.subscribe((formData: any) => {
        if (isEditMode && company?.id) {
          this.updateCompany(company.id, formData, dialogRef);
        } else {
          this.createCompany(formData, dialogRef);
        }
      });

      // Wait for form to be initialized
      setTimeout(() => {
        const form = componentInstance.form;
        if (form) {
          // Disable city field initially if no country is selected (create mode)
          if (!isEditMode || !initialData?.['counteryId']) {
            const cityControl = form.get('cityId');
            if (cityControl) {
              cityControl.disable();
            }
          }

          // Disable phone prefix field (it's always disabled)
          const prefixControl = form.get('phonePrefix');
          if (prefixControl) {
            prefixControl.disable();
          }

          // Set phone prefix automatically if country is already selected (edit mode or initial load)
          const currentCountryId = form.get('counteryId')?.value;
          if (currentCountryId) {
            this.setPhonePrefix(Number(currentCountryId), form);
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

              // Set phone prefix automatically when country changes
              this.setPhonePrefix(Number(countryId), form);
            } else {
              // Clear cities when no country is selected
              this.loadCitiesByCountryId(0);
              form.get('cityId')?.setValue('', { emitEvent: false });
              // Disable city field when no country is selected
              form.get('cityId')?.disable();
              // Clear phone prefix when country is cleared
              this.clearPhonePrefix(form);
            }
          });
        }
      }, 200);

      // Keep afterClosed in case user cancels
      dialogRef.afterClosed().subscribe(() => {});
    };

    // Wait a bit for cities to load if needed (edit mode with city)
    if (isEditMode && company?.cityName && initialData?.['counteryId']) {
      setTimeout(openDialog, 500);
    } else {
      openDialog();
    }
  }

  // =============================== add company ===================
  onAddCompany(): void {
    this.openCompanyForm();
  }
  // =============================== map company to form data ===================
  private mapCompanyToFormData(company: ICompanyFilter): Record<string, any> {
    // Parse phone number to extract prefix and number
    let phonePrefix = '';
    let phoneNumber = '';

    if (company.phoneNumber) {
      // Try to extract prefix (usually starts with +)
      const phoneMatch = company.phoneNumber.match(/^(\+\d+)\s*(.+)$/);
      if (phoneMatch) {
        phonePrefix = phoneMatch[1];
        phoneNumber = phoneMatch[2];
      } else {
        phoneNumber = company.phoneNumber;
      }
    }

    // Find IDs from names
    const industry = this.industries.find(
      (ind) => ind.name === company.industeryName
    );
    const country = this.countries.find(
      (country) => country.name === company.countryName
    );

    // If phone prefix is not found in phone number, try to get it from country prefix map
    if (!phonePrefix && country?.id) {
      const countryPrefix = this.countryPrefixMap.get(country.id);
      if (countryPrefix) {
        phonePrefix = countryPrefix.startsWith('+')
          ? countryPrefix
          : `+${countryPrefix}`;
      }
    }

    // Note: We need to load cities for the country first to get cityId
    // For now, we'll set cityId to 0 and let the form handle it
    let cityId = 0;
    if (company.cityName && country?.id) {
      // Load cities and find the city
      const city = this.cityList.find((city) => city.name === company.cityName);
      cityId = city?.id || 0;
    }

    return {
      companyName: company.name || '',
      email: company.email || '',
      phonePrefix: phonePrefix,
      phoneNumber: phoneNumber,
      industeryId: industry?.id || 0,
      companySizeId: 0, // Not available in ICompanyFilter
      companyStageId: 0, // Not available in ICompanyFilter
      ownershipId: 0, // Not available in ICompanyFilter
      counteryId: country?.id || 0,
      cityId: cityId,
      addressLine: company.addressLine || '',
    };
  }

  // =============================== edit company ===================
  onEditCompany(company: ICompanyFilter): void {
    this.openCompanyForm(company);
  }

  // =============================== create company ===================
  createCompany(formData: any, dialogRef?: any): void {
    // Combine phone prefix and phone number
    const phonePrefix = formData.phonePrefix || '';
    const phoneNumber = formData.phoneNumber || '';

    // Ensure prefix is included with phone number
    let fullPhoneNumber = '';
    if (phonePrefix && phoneNumber) {
      // Both prefix and number exist - combine them
      fullPhoneNumber = `${phonePrefix} ${phoneNumber}`;
    } else if (phoneNumber) {
      // Only number exists - use it as is
      fullPhoneNumber = phoneNumber;
    } else if (phonePrefix) {
      // Only prefix exists - use it
      fullPhoneNumber = phonePrefix;
    }

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
        }

        // Close the dialog after API response
        dialogRef?.close();
      },
      error: (error) => {
        this.notify.error({
          title: 'خطأ',
          description: 'حدث خطأ أثناء إنشاء الشركة',
        });
      },
    });
  }

  // =============================== update company ===================
  updateCompany(companyId: number, formData: any, dialogRef?: any): void {
    // Combine phone prefix and phone number
    const phonePrefix = formData.phonePrefix || '';
    const phoneNumber = formData.phoneNumber || '';

    // Ensure prefix is included with phone number
    let fullPhoneNumber = '';
    if (phonePrefix && phoneNumber) {
      // Both prefix and number exist - combine them
      fullPhoneNumber = `${phonePrefix} ${phoneNumber}`;
    } else if (phoneNumber) {
      // Only number exists - use it as is
      fullPhoneNumber = phoneNumber;
    } else if (phonePrefix) {
      // Only prefix exists - use it
      fullPhoneNumber = phonePrefix;
    }

    // Map form data to API payload (ICreateCompany)
    const payload: ICreateCompany = {
      id: companyId,
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

    this._companiesService.updateCompany(payload).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          // Reload companies list to get the updated data with all fields
          this.loadCompanies();

          this.notify.success({
            title: 'نجاح',
            description: 'تم تحديث الشركة بنجاح',
          });
        } else {
          this.notify.error({
            title: 'خطأ',
            description: response.message || 'فشل تحديث الشركة',
          });
        }

        // Close the dialog after API response
        dialogRef?.close();
      },
      error: (error) => {
        this.notify.error({
          title: 'خطأ',
          description: error?.error?.message || 'حدث خطأ أثناء تحديث الشركة',
        });
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
