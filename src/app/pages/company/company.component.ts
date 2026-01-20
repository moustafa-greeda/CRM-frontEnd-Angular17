import {
  Component,
  OnInit,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ActionButton } from '../../shared/interfaces/action-button.interface';
import { ICompanyFilter } from '../../core/Models/common/icompanies';
import { NgxSpinnerService } from 'ngx-spinner';
import { CompanyDataService } from './services/company-data.service';
import { CompanyFormHandler } from './services/company-form.handler';
import { CompanyCrudService } from './services/company-crud.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DropdownComponent } from '../../shared/components/dropdown/dropdown.component';
import { SearchInputComponent } from '../../shared/ui/search-input/search-input.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { ViewToggleComponent } from '../../shared/ui/view-toggle/view-toggle.component';
import { PaginationControlsComponent } from '../../shared/components/pagination-card/pagination-card-controls.component';
import { GridCardsComponent } from '../../shared/ui/grid-cards/grid-cards.component';
import { CardComponent } from '../../shared/components/card/card.component';
import { PaginationComponent } from '../../shared/components/pagination-card/pagination.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { NoResultsMessageComponent } from '../../shared/components/no-results-message/no-results-message.component';

@Component({
  selector: 'app-company',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    DropdownComponent,
    SearchInputComponent,
    ButtonComponent,
    ViewToggleComponent,
    PaginationControlsComponent,
    GridCardsComponent,
    CardComponent,
    PaginationComponent,
    TableComponent,
    NoResultsMessageComponent,
  ],
  templateUrl: './company.component.html',
  styleUrl: './company.component.css',
  // ⚡ تحسين الأداء - Change Detection على الـ Signals فقط
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyComponent implements OnInit {
  // UI State
  readonly pageTitle = 'ادارة الشركات';
  readonly breadcrumb = [
    { label: 'الرئيسية', path: '/dashboard/admin' },
    { label: 'الشركات', path: '/dashboard/admin/company' },
  ];
  readonly searchPlaceholder = 'ابحث عن شركة';

  viewMode = signal<'card' | 'table'>('card');

  // ========== البيانات ==========
  companyList = signal<ICompanyFilter[]>([]);

  // ========== الفلاتر ==========
  lastSearchTerm = signal<string>('');
  selectedCountry = signal<string | null>(null);
  selectedCity = signal<string | null>(null);

  // ========== الـ Pagination ==========
  pageIndex = signal<number>(1);
  pageSize = signal<number>(10);
  totalCount = signal<number>(0);

  // ⚡ Loading state منفصل - مش هنستخدمه عشان مايعملش animation
  private _isLoadingCompanies = signal<boolean>(false);

  // ✅ نستخدم flag للتحميل الأول بس
  isInitialLoad = signal<boolean>(true);

  isLoadingFormData = signal<boolean>(true);

  // Selection State
  selectedCompanies = signal<Set<number>>(new Set());
  isAllSelected = signal<boolean>(false);

  // ========== Computed Signals ==========
  readonly totalPages = computed(() => {
    const pages = Math.ceil(this.totalCount() / this.pageSize());
    return pages > 0 ? pages : 0;
  });

  readonly currentPage = computed(() => this.pageIndex());

  readonly hasActiveSearchTerm = computed(() => {
    const term = this.lastSearchTerm();
    return !!term && term.trim().length > 0;
  });

  readonly hasNoCompanies = computed(
    () => this.isInitialLoad() === false && this.companyList().length === 0
  );

  // ✅ نعرض loading فقط في التحميل الأول
  readonly isLoadingCompanies = computed(
    () => this.isInitialLoad() && this._isLoadingCompanies()
  );

  readonly tableColumns = computed(() => [
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
  ]);

  readonly countryOptions = this.dataService.countryOptions;
  readonly cityOptions = this.dataService.cityOptions;

  actionButtons: ActionButton[] = [
    {
      label: 'إضافة شركة',
      iconClass: 'bi bi-plus',
      click: () => this.onAddCompany(),
    },
  ];

  constructor(
    private dataService: CompanyDataService,
    private formHandler: CompanyFormHandler,
    private crudService: CompanyCrudService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadAllInitialData();
    this.loadCompanies();
  }

  // ==========================================================
  // 📥 تحميل البيانات (Fast - بدون animation)
  // ==========================================================
  loadCompanies(filter?: ICompanyFilter): void {
    // ✅ Prevent duplicate API calls if already loading
    if (this._isLoadingCompanies()) {
      return;
    }

    // ⚡ نخلي الـ loading flag = true بس مش هنعرضه في الـ UI
    this._isLoadingCompanies.set(true);

    const filterWithPagination: ICompanyFilter = {
      ...filter,
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
    };

    this.dataService.loadCompanies(filterWithPagination).subscribe({
      next: (response) => {
        // ⚡ تحديث البيانات مباشرة بدون أي تأخير
        this.companyList.set(response.companies);
        this.totalCount.set(response.totalCount);

        // ✅ بعد أول تحميل، نخلي isInitialLoad = false
        if (this.isInitialLoad()) {
          this.isInitialLoad.set(false);
        }

        this._isLoadingCompanies.set(false);
        this.updateSelectAllState();
      },
      error: () => {
        this.companyList.set([]);
        this.totalCount.set(0);
        this._isLoadingCompanies.set(false);

        if (this.isInitialLoad()) {
          this.isInitialLoad.set(false);
        }
      },
    });
  }

  loadAllInitialData(): void {
    this.spinner.show();

    this.dataService.loadAllInitialData().subscribe({
      next: (data) => {
        this.isLoadingFormData.set(false);
        this.spinner.hide();
      },
      error: () => {
        this.isLoadingFormData.set(false);
        this.spinner.hide();
      },
    });
  }

  loadCitiesByCountryId(countryId: number): void {
    this.dataService.loadCitiesByCountryId(countryId).subscribe({
      next: (cities) => {
        this.formHandler.updateCityOptions(cities);
      },
      error: () => {
        this.formHandler.updateCityOptions([]);
      },
    });
  }

  // ==========================================================
  // 🔍 البحث والفلترة
  // ==========================================================
  onSearch(searchTerm: string): void {
    this.pageIndex.set(1);
    this.lastSearchTerm.set(searchTerm || '');
    this.applyFilters();
  }

  onCountryMethodChange(countryName: string): void {
    this.selectedCountry.set(countryName);
    const countries = this.dataService.getCurrentCountries();
    const selected = countries.find((c) => c.name === countryName);

    if (selected?.id) {
      this.loadCitiesByCountryId(selected.id);
    } else {
      this.loadCitiesByCountryId(0);
    }

    this.pageIndex.set(1);
    this.applyFilters();
  }

  onCityChange(cityName: string): void {
    this.selectedCity.set(cityName);
    this.pageIndex.set(1);
    this.applyFilters();
  }

  resetFilters(): void {
    this.selectedCountry.set(null);
    this.selectedCity.set(null);
    this.lastSearchTerm.set('');
    this.pageIndex.set(1);
    this.dataService.clearCities();
    this.loadCitiesByCountryId(0);
    this.loadCompanies();
  }

  private applyFilters(): void {
    const filter: ICompanyFilter = {};

    const searchTerm = this.lastSearchTerm();
    const country = this.selectedCountry();
    const city = this.selectedCity();

    if (searchTerm) {
      filter.searchKeyword = searchTerm;
    }
    if (country) {
      filter.countryName = country;
    }
    if (city) {
      filter.cityName = city;
    }

    this.loadCompanies(filter);
  }

  // ==========================================================
  // 📄 الـ Pagination (⚡ سريع بدون animation)
  // ==========================================================
  onPageSizeChange(pageSize: number): void {
    this.pageSize.set(pageSize);
    this.pageIndex.set(1);
    this.applyFilters();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.pageIndex()) {
      this.pageIndex.set(page);
      this.applyFilters();
    }
  }

  handlePageChange(event: any): void {
    this.onPageChange(event as number);
  }

  onTablePage(event: any): void {
    const newPage = (event?.pageIndex ?? 0) + 1;
    const pageChanged = newPage !== this.pageIndex();
    const pageSizeChanged =
      event?.pageSize && event.pageSize !== this.pageSize();

    if (pageChanged) {
      this.pageIndex.set(newPage);
    }
    if (pageSizeChanged) {
      this.pageSize.set(event.pageSize);
    }

    // Only call applyFilters if something actually changed
    if (pageChanged || pageSizeChanged) {
      this.applyFilters();
    }
  }

  onTablePageSize(newSize: number): void {
    if (newSize && newSize !== this.pageSize()) {
      this.pageSize.set(newSize);
      this.pageIndex.set(1);
      this.applyFilters();
    }
  }

  // ==========================================================
  // CRUD Operations
  // ==========================================================
  onAddCompany(): void {
    this.openCompanyForm(null);
  }

  onEditCompany(company: ICompanyFilter): void {
    this.openCompanyForm(company);
  }

  onViewClient(company: ICompanyFilter): void {
    this.onEditCompany(company);
  }

  onEditClient(company: ICompanyFilter): void {
    this.onEditCompany(company);
  }

  onDeleteClient(company: ICompanyFilter): void {
    if (company.id) {
      this.crudService.deleteCompany(company.id);
    }
  }

  private openCompanyForm(company: ICompanyFilter | null): void {
    if (this.isLoadingFormData()) return;

    const industries = this.dataService.getCurrentIndustries();
    const companySizes = this.dataService.getCurrentCompanySizes();
    const companyStages = this.dataService.getCurrentCompanyStages();
    const ownerships = this.dataService.getCurrentOwnerships();
    const countries = this.dataService.getCurrentCountries();

    const hasAllOptions =
      industries.length > 0 &&
      companySizes.length > 0 &&
      companyStages.length > 0 &&
      ownerships.length > 0 &&
      countries.length > 0;

    if (!hasAllOptions) return;

    const dialogRef = this.formHandler.openForm(
      company,
      {
        industries,
        companySizes,
        companyStages,
        ownerships,
        countries,
        cityList: this.dataService.getCurrentCities(),
        countryPrefixMap: this.dataService.getCurrentCountryPrefixMap(),
      },
      {
        onLoadCities: (countryId) => this.loadCitiesByCountryId(countryId),
        onSubmit: (formData, isEdit, companyId) => {
          if (isEdit && companyId) {
            this.crudService.updateCompany(
              companyId,
              formData,
              () => this.loadCompanies(),
              () => dialogRef.close()
            );
          } else {
            this.crudService.createCompany(
              formData,
              () => this.loadCompanies(),
              () => dialogRef.close()
            );
          }
        },
      }
    );
  }

  // ==========================================================
  // Selection Methods
  // ==========================================================
  onSelectAllChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.isAllSelected.set(isChecked);

    const newSelection = new Set<number>();
    if (isChecked) {
      this.companyList().forEach((company: ICompanyFilter) => {
        if (company.id != null) {
          newSelection.add(company.id);
        }
      });
    }
    this.selectedCompanies.set(newSelection);
  }

  onCardSelectionChange(company: any, isSelected: boolean): void {
    const currentSelection = new Set(this.selectedCompanies());

    if (isSelected) {
      currentSelection.add(company.id);
    } else {
      currentSelection.delete(company.id);
    }

    this.selectedCompanies.set(currentSelection);
    this.updateSelectAllState();
  }

  isCompanySelected(company: any): boolean {
    return company.id != null && this.selectedCompanies().has(company.id);
  }

  private updateSelectAllState(): void {
    const companyList = this.companyList();
    const selected = this.selectedCompanies();

    const allSelected =
      companyList.length > 0 &&
      companyList.every(
        (company: ICompanyFilter) =>
          company.id != null && selected.has(company.id)
      );

    this.isAllSelected.set(allSelected);
  }

  // ==========================================================
  // Utility Methods
  // ==========================================================
  trackByCompanyId(index: number, company: any): any {
    return company?.id || index;
  }

  toggleDropdown(dropdown: any): void {
    dropdown.open = !dropdown.open;
  }

  selectOption(dropdown: any, option: any): void {
    dropdown.selected = option;
    dropdown.open = false;
  }
}
