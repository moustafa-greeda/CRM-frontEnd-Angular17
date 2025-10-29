import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { CompanyData } from '../model/interfaces';
import { PersonalServiceService } from '../personal-data-table/personal-service.service';
import { CompanyService, CompanyFilterParams } from './company.service';
import { TableExportService } from '../shared/table-export.service';
import { TableSelectionService } from '../shared/table-selection.service';
import { NotifyDialogService } from '../../../shared/notify-dialog-host/notify-dialog.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-company-table',
  templateUrl: './company-table.component.html',
  styleUrls: ['./company-table.component.css'],
})
export class CompanyTableComponent implements OnInit {
  @Input() data: CompanyData[] = [];
  @Output() filteredDataChange = new EventEmitter<CompanyData[]>();
  @Output() selectedRowsChange = new EventEmitter<CompanyData[]>();

  i = 1;
  filterForm!: FormGroup;
  filteredData$!: Observable<CompanyData[]>;
  selectedRows: CompanyData[] = [];
  isAllSelected = false;

  // Country and City data
  cities: any[] = [];
  countries: any[] = [];
  countryId!: number;
  cityId!: number;
  countryButtonClicked = false;
  cityButtonClicked = false;
  jobTitles: any[] = [];
  jobLevels: any[] = [];
  industries: any[] = [];
  comapnySize: any[] = [];
  allCompanyDropDown: any[] = [];
  companyStage: any[] = [];
  allOwnerShip: any[] = [];

  // Filter button functionality
  showFilterButtons = true;
  selectedFilters: any[] = [];
  filtersExecuted = false; // Track if filters have been executed - starts as false to show background image
  showDataTable = false; // Control whether to show data table
  hasNoData = false; // Track if there are no results

  // Location dropdown visibility
  showCountryDropdown = false;
  showCityDropdown = false;
  showJobTitleDropdown = false;
  showJobLevelDropdown = false;
  showIndustryDropdown = false;
  showComapnySizeDropdown = false;

  // Paginator properties
  totalCount$ = new BehaviorSubject<number>(0);
  currentPage = 0;
  pageSize = 10;

  // API data properties
  apiData$ = new BehaviorSubject<CompanyData[]>([]);
  isUsingApi = false;

  // Export configuration
  exportConfig = {
    showSelectedExport: true,
    showCurrentPageExport: true,
    showAllDataExport: true,
    selectedFileName: 'الشركات المحددة',
    currentPageFileName: 'صفحة الشركات الحالية',
    allDataFileName: 'جميع الشركات',
    showSpinner: true,
    spinnerMessage: 'جاري التصدير...',
  };

  availableFilters = [
    {
      id: 'digitalTransactions',
      name: 'التعاملات الرقمية',
      type: 'select',
      options: ['منخفض', 'متوسط', 'عالي', 'ممتاز'],
    },
    {
      id: 'ownership',
      name: 'نوع الملكية',
      type: 'select',
      options: [],
      isDynamic: true,
    },
    {
      id: 'companyStage',
      name: 'مرحلة الشركة',
      type: 'select',
      options: [],
      isDynamic: true,
    },
    { id: 'size', name: 'الحجم', type: 'select', options: [], isDynamic: true },
    {
      id: 'industry',
      name: 'الصناعة',
      type: 'select',
      options: [],
      isDynamic: true,
    },
    {
      id: 'companyName',
      name: 'اسم الشركة',
      type: 'select',
      options: [],
      isDynamic: true,
    },
    {
      id: 'country',
      name: 'الدولة',
      type: 'location',
      options: [],
      isDynamic: true,
    },
    {
      id: 'city',
      name: 'المدينة',
      type: 'location',
      options: [],
      isDynamic: true,
    },
  ];

  // Icon mapping for filter buttons
  getFilterIcon(filterId: string): string {
    const iconMap: { [key: string]: string } = {
      digitalTransactions: 'computer',
      ownership: 'account_balance',
      companyStage: 'trending_up',
      size: 'bar_chart',
      industry: 'factory',
      companyName: 'business_center',
      country: 'public',
      city: 'location_city',
    };
    return iconMap[filterId] || 'search';
  }

  // Animation state management
  animationStates: { [key: string]: string } = {};

  // Get animation class for dropdown
  getDropdownAnimationClass(dropdownType: string, isVisible: boolean): string {
    if (isVisible) {
      this.animationStates[dropdownType] = 'add-anim';
      return 'add-anim';
    } else {
      this.animationStates[dropdownType] = 'remove-anim';
      return 'remove-anim';
    }
  }

  // Toggle dropdown with animation
  toggleDropdownWithAnimation(dropdownType: string) {
    const currentState = this.animationStates[dropdownType];

    if (currentState === 'add-anim' || !currentState) {
      // Start remove animation
      this.animationStates[dropdownType] = 'remove-anim';

      // After animation completes, hide the dropdown
      setTimeout(() => {
        (this as any)[`show${dropdownType}Dropdown`] = false;
        this.animationStates[dropdownType] = '';
      }, 300); // Match the remove-anim duration
    } else {
      // Show dropdown and start add animation
      (this as any)[`show${dropdownType}Dropdown`] = true;
      this.animationStates[dropdownType] = 'add-anim';
    }
  }

  // Filter options for company data
  digitalTransactionsOptions = ['منخفض', 'متوسط', 'عالي', 'ممتاز'];
  ownershipOptions = ['عامة', 'خاصة', 'مختلطة', 'حكومية'];
  companyStageOptions = ['ناشئة', 'نامية', 'مستقرة', 'متقدمة', 'راسخة'];
  sizeOptions = [
    'صغيرة (1-10)',
    'متوسطة صغيرة (11-50)',
    'متوسطة (51-200)',
    'كبيرة (201-1000)',
    'كبيرة جداً (1000+)',
  ];

  constructor(
    private fb: FormBuilder,
    private personalService: PersonalServiceService,
    private companyService: CompanyService,
    private exportService: TableExportService,
    private selectionService: TableSelectionService<CompanyData>,
    private notifyDialog: NotifyDialogService,
    private spinner: NgxSpinnerService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.setupFiltering();
    this.setupSelectionService();
    this.getCountries();
    this.getCompanySizes();
    this.getIndustry();
    // this.getAllCompanyDropDown();
    this.getCompanyStage();
    this.getAllOwnerShip();
    this.initializeSteps();
    this.initializeAudio();

    // التأكد من إخفاء الجدول في البداية
    this.showDataTable = false;
    this.filtersExecuted = false;

    // البيانات ستأتي من API عند تطبيق الفلاتر فقط
    this.data = [];

    // Listen for window resize to recalculate step width
    window.addEventListener('resize', () => {
      this.calculateStepWidth();
      this.moveNinjaToStep(this.currentStep, false); // Recalculate current position without sound
    });

    // Listen for sidebar toggle or any layout changes
    setTimeout(() => {
      this.calculateStepWidth();
      this.moveNinjaToStep(this.currentStep, false);
    }, 100);

    // Additional listener for sidebar toggle with longer delay
    setTimeout(() => {
      this.calculateStepWidth();
      this.moveNinjaToStep(this.currentStep, false);
    }, 500);

    // Listen for any DOM changes that might affect the container width
    const observer = new MutationObserver(() => {
      this.calculateStepWidth();
      this.moveNinjaToStep(this.currentStep, false);
    });

    // Observe changes to the steps container
    const stepsContainer = document.querySelector('.steps');
    if (stepsContainer) {
      observer.observe(stepsContainer, {
        attributes: true,
        childList: true,
        subtree: true,
      });
    }

    // Listen for transition events on the steps container
    if (stepsContainer) {
      stepsContainer.addEventListener('transitionend', () => {
        this.calculateStepWidth();
        this.moveNinjaToStep(this.currentStep, false);
      });
    }
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      digitalTransactions: [''],
      ownership: [''],
      country: [''],
      city: [''],
      companyStage: [''],
      size: [''],
      industry: [''],
      companyName: [''],
    });
  }

  private setupFiltering(): void {
    this.filteredData$ = combineLatest([
      new BehaviorSubject(this.data),
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.value)),
    ]).pipe(
      debounceTime(300),
      map(([data, filters]) => this.applyFilters(data, filters))
    );

    this.filteredData$.subscribe((filteredData) => {
      this.filteredDataChange.emit(filteredData);
    });
  }

  private setupSelectionService(): void {
    // Subscribe to selection changes
    this.selectionService.selectedRows$.subscribe((selectedRows) => {
      this.selectedRows = selectedRows;
      this.selectedRowsChange.emit(this.selectedRows);
    });
  }

  private applyFilters(data: CompanyData[], filters: any): CompanyData[] {
    return data.filter((item) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableFields = [
          item.companyName,
          item.industry,
          item.size,
          item.companyStage,
          item.location,
          item.ownership,
          item.digitalTransactions,
        ];

        if (
          !searchableFields.some((field) =>
            field?.toLowerCase().includes(searchTerm)
          )
        ) {
          return false;
        }
      }

      // Individual filters for company data
      if (
        filters.digitalTransactions &&
        item.digitalTransactions !== filters.digitalTransactions
      )
        return false;
      if (filters.ownership && item.ownership !== filters.ownership)
        return false;
      if (
        filters.country &&
        !item.location?.toLowerCase().includes(filters.country.toLowerCase())
      )
        return false;
      if (
        filters.city &&
        !item.location?.toLowerCase().includes(filters.city.toLowerCase())
      )
        return false;
      if (filters.companyStage && item.companyStage !== filters.companyStage)
        return false;
      if (filters.companyName) {
        // Handle company name filter - could be ID or name
        const itemCompanyName = item.companyName;
        if (itemCompanyName !== filters.companyName) return false;
      }
      if (filters.size) {
        // Handle size filter - could be ID or name
        const itemSize = item.size;
        if (itemSize !== filters.size) return false;
      }
      if (filters.industry) {
        // Handle industry filter - could be ID or name
        const itemIndustry = item.industry;
        if (itemIndustry !== filters.industry) return false;
      }
      if (
        filters.companyName &&
        !item.companyName
          ?.toLowerCase()
          .includes(filters.companyName.toLowerCase())
      )
        return false;

      if (filters.ownership) {
        // Handle ownership filter - could be ID or name
        const itemOwnership = item.ownership;
        if (itemOwnership !== filters.ownership) return false;
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

  onSelectRow(row: CompanyData, event: any): void {
    if (event.checked) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows = this.selectedRows.filter(
        (item) => item.id !== row.id
      );
    }
    this.isAllSelected = this.selectedRows.length === this.data.length;
    this.selectedRowsChange.emit(this.selectedRows);
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  getActiveFiltersCount(): number {
    let count = this.selectedFilters.length;

    // Count active dropdown filters
    if (this.showCountryDropdown) count++;
    if (this.showCityDropdown) count++;
    if (this.showJobTitleDropdown) count++;
    if (this.showJobLevelDropdown) count++;
    if (this.showIndustryDropdown) count++;
    if (this.showComapnySizeDropdown) count++;

    return count;
  }

  toggleFilterButtons(): void {
    this.showFilterButtons = !this.showFilterButtons;
  }

  addFilter(filterId: string) {
    const filter = this.availableFilters.find((f) => f.id === filterId);
    if (filter && !this.selectedFilters.find((f) => f.id === filterId)) {
      // Handle location filters specially
      if (filterId === 'country') {
        this.toggleCountryDropdown();
      } else if (filterId === 'city') {
        this.toggleCityDropdown();
      } else {
        this.selectedFilters.push({
          ...filter,
          value: '',
          isActive: true,
        });
        // Update steps and recalculate width when filters change
        this.updateSteps();
      }
    }
    // this.showFilterButtons = false;
  }

  removeFilter(filterId: string) {
    this.selectedFilters = this.selectedFilters.filter(
      (f) => f.id !== filterId
    );
    // Update steps and recalculate width when filters change
    this.updateSteps();
  }

  isFilterSelected(filterId: string): boolean {
    // Handle location filters specially
    if (filterId === 'country') {
      return this.countryButtonClicked;
    } else if (filterId === 'city') {
      return this.cityButtonClicked;
    }
    return !!this.selectedFilters.find((f) => f.id === filterId);
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
    const filter = this.selectedFilters.find((f) => f.id === filterId);
    if (filter) {
      filter.value = value;
    }
  }

  clearAllFilters() {
    this.selectedFilters = [];
    this.showCountryDropdown = false;
    this.showCityDropdown = false;
    this.countryId = 0;
    this.cityId = 0; // Reset city ID as well
    this.cities = [];
    this.countryButtonClicked = false; // Reset country button clicked state
    this.cityButtonClicked = false; // Reset city button clicked state
    this.filterForm.reset();
    this.updateSteps();
    // إعادة النينجا للموضع الافتراضي (الخطوة 1)
    this.moveNinjaToStep(0);
    // Reset filters executed flag
    this.filtersExecuted = false;
    this.showDataTable = false; // إخفاء الجدول
    this.hasNoData = false; // إعادة تعيين حالة عدم وجود البيانات
    // Reset API state
    this.isUsingApi = false;
    this.apiData$.next([]);
    this.totalCount$.next(0);
    this.currentPage = 0;
  }

  // Toggle audio on/off
  toggleAudio(): void {
    this.isAudioEnabled = !this.isAudioEnabled;
  }

  hasActiveFilters(): boolean {
    return (
      this.selectedFilters.length > 0 ||
      this.showCountryDropdown ||
      this.showCityDropdown ||
      this.showJobTitleDropdown ||
      this.showJobLevelDropdown ||
      this.showIndustryDropdown ||
      this.showComapnySizeDropdown
    );
  }

  executeFilters() {
    // جمع جميع المعاملات من الفلاتر المختارة
    const filterParams: CompanyFilterParams = {
      pageIndex: this.currentPage + 1, // API uses 1-based indexing
      pageSize: this.pageSize,
    };

    // إضافة معاملات الفلاتر المختارة
    this.selectedFilters.forEach((filter) => {
      if (filter.value) {
        switch (filter.id) {
          case 'companyName':
            // Find the selected company name from the dropdown options
            const selectedCompany = this.allCompanyDropDown.find(
              (company) => company.id == filter.value
            );
            if (selectedCompany) {
              filterParams.name = selectedCompany.name;
            } else {
              filterParams.name = filter.value;
            }
            break;
          case 'industry':
            // Find the selected industry name from the dropdown options
            const selectedIndustry = this.industries.find(
              (industry) => industry.id == filter.value
            );
            if (selectedIndustry) {
              filterParams.industryName = selectedIndustry.name;
            } else {
              filterParams.industryName = filter.value;
            }
            break;
          case 'size':
            // Find the selected company size name from the dropdown options
            const selectedSize = this.comapnySize.find(
              (size) => size.id == filter.value
            );
            if (selectedSize) {
              filterParams.companySize =
                selectedSize.sizeName || selectedSize.name;
            } else {
              filterParams.companySize = filter.value;
            }
            break;
          case 'companyStage':
            // Find the selected company stage name from the dropdown options
            const selectedStage = this.companyStage.find(
              (stage) => stage.id == filter.value
            );
            if (selectedStage) {
              filterParams.companyStage = selectedStage.name;
            } else {
              filterParams.companyStage = filter.value;
            }
            break;
          case 'ownership':
            // Find the selected ownership name from the dropdown options
            const selectedOwnership = this.allOwnerShip.find(
              (ownership) => ownership.id == filter.value
            );
            if (selectedOwnership) {
              filterParams.ownerShip = selectedOwnership.name;
            } else {
              filterParams.ownerShip = filter.value;
            }
            break;
          case 'digitalTransactions':
            filterParams.digitalTransformation = filter.value;
            break;
        }
      }
    });

    // إضافة معاملات الموقع - البحث عن اسم الدولة والمدينة
    if (this.countryId) {
      const selectedCountry = this.countries.find(
        (c) => c.id == this.countryId
      );
      if (selectedCountry) {
        filterParams.country = selectedCountry.name;
      }
    }
    if (this.cityId) {
      const selectedCity = this.cities.find((c) => c.id == this.cityId);
      if (selectedCity) {
        filterParams.city = selectedCity.name;
      }
    }

    // Compare with working Swagger URL
    this.companyService.GetCompanies(filterParams).subscribe({
      next: (res) => {
        if (res.data && res.data.items) {
          // API يعيد البيانات في res.data.items

          // إضافة id إذا لم يكن موجوداً
          const processedData = res.data.items.map(
            (item: any, index: number) => ({
              ...item,
              id: item.id || item.companyId || item.CompanyId || index + 1,
            })
          );

          this.data = processedData; // تحديث البيانات المحلية
          this.apiData$.next(processedData);
          this.isUsingApi = true;
          this.filtersExecuted = true;
          this.showDataTable = true;
          this.hasNoData = processedData.length === 0;
          this.totalCount$.next(res.data.totalCount || processedData.length);
        } else {
          this.apiData$.next([]);
          this.hasNoData = true;
          this.totalCount$.next(0);
        }
      },
      error: (error) => {
        console.error('Error loading companies from API:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url,
          error: error.error,
        });

        // معالجة أخطاء محددة
        if (error.status === 400) {
          console.error('Bad Request - Check parameters:', filterParams);
        }

        this.apiData$.next([]);
        this.hasNoData = true;
        this.totalCount$.next(0);
      },
    });
  }

  // ================================= Paginator methods ===============================
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    // إعادة تطبيق الفلاتر مع الصفحة الجديدة
    if (this.isUsingApi) {
      // إذا كنا نستخدم API، نعيد تحميل البيانات مع الصفحة الجديدة
      this.executeFilters();
    }
    // إذا كنا نستخدم البيانات المحلية، لا نحتاج لفعل شيء لأن getCurrentPageData() سيتولى الأمر
  }

  // ================================= Country methods ===============================
  getCountries() {
    this.personalService.getAllCountries().subscribe({
      next: (res) => {
        if (res.data) {
          this.countries = res.data;
        } else {
          this.countries = [];
        }
      },
      error: (error) => {
        console.error('Error loading countries:', error);
        this.countries = [];
      },
    });
  }

  // ================================= Company Size methods ===============================
  getCompanySizes() {
    this.personalService.GetComapnySize().subscribe({
      next: (res) => {
        if (res.data) {
          this.comapnySize = res.data;
          const sizeFilter = this.availableFilters.find((f) => f.id === 'size');
          if (sizeFilter) {
            sizeFilter.options = res.data.map((item: any) => ({
              value: item.id,
              label: item.sizeName || item.name,
            }));
          }
        }
      },
      error: (error) => {
        console.error('Error loading company sizes:', error);
        this.comapnySize = [];
      },
    });
  }

  // ==================================== City methods ===================================
  onCountryChange(event: any) {
    this.countryId = event.target.value;
    this.cityId = 0; // Reset city when country changes
    if (this.countryId) {
      this.personalService.getCitiesByCountryId(this.countryId).subscribe({
        next: (res) => {
          this.cities = res.data || [];
        },
        error: (error) => {
          console.error('Error loading cities:', error);
          this.cities = [];
        },
      });
    } else {
      this.cities = [];
    }
  }

  onCityChange(event: any) {
    this.cityId = event.target.value;
  }

  // ==================================== industry  methods ===================================

  getIndustry() {
    this.personalService.GetIndustry().subscribe({
      next: (res) => {
        if (res.data) {
          this.industries = res.data;
          // Update the industry filter options with API data
          const industryFilter = this.availableFilters.find(
            (f) => f.id === 'industry'
          );
          if (industryFilter) {
            industryFilter.options = res.data.map((item: any) => ({
              value: item.id,
              label: item.name,
            }));
          }
        }
      },
      error: (error) => {
        console.error('Error loading industries:', error);
        this.industries = [];
      },
    });
  }

  // ==================================== GetAllCompany methods ===================================
  getAllCompanyDropDown() {
    this.companyService.GetAllCompanyDropDown().subscribe({
      next: (res) => {
        if (res.data) {
          this.allCompanyDropDown = res.data;
          const companyNameFilter = this.availableFilters.find(
            (f) => f.id === 'companyName'
          );
          if (companyNameFilter) {
            companyNameFilter.options = res.data.map((item: any) => ({
              value: item.id,
              label: item.name,
            }));
          }
        }
      },
    });
  }

  // ==================================== GetCompanyStage methods ===================================
  getCompanyStage() {
    this.companyService.GetCompanyStage().subscribe({
      next: (res) => {
        this.companyStage = res.data;
        const companyStageFilter = this.availableFilters.find(
          (f) => f.id === 'companyStage'
        );
        if (companyStageFilter) {
          companyStageFilter.options = res.data.map((item: any) => ({
            value: item.id,
            label: item.name,
          }));
        }
      },
    });
  }

  // ==================================== GetAllOwnerShip methods ===================================
  getAllOwnerShip() {
    this.companyService.GetAllOwnerShip().subscribe({
      next: (res) => {
        this.allOwnerShip = res.data;
        const ownershipFilter = this.availableFilters.find(
          (f) => f.id === 'ownership'
        );
        if (ownershipFilter) {
          ownershipFilter.options = res.data.map((item: any) => ({
            value: item.id,
            label: item.name,
          }));
        }
      },
    });
  }

  // Toggle methods for location dropdowns
  toggleCountryDropdown() {
    this.showCountryDropdown = !this.showCountryDropdown;
    this.countryButtonClicked = true; // Mark button as clicked
    if (this.showCountryDropdown) {
      this.moveNinjaToStep(6); // Move ninja to country step (7th step, index 6)
    }
  }

  toggleCityDropdown() {
    if (this.countryId) {
      this.showCityDropdown = !this.showCityDropdown;
      this.cityButtonClicked = true; // Mark button as clicked
      if (this.showCityDropdown) {
        this.moveNinjaToStep(7); // Move ninja to city step (8th step, index 7)
      }
    }
  }

  // ========================= status bar code =============================
  // Add these properties after the existing properties
  steps: string[] = [];
  currentStep = 0;
  markerLeft = 0;
  showFilters = false;
  stepWidth = 150; // Dynamic step width based on container

  // Audio properties
  private jumpSound: HTMLAudioElement | null = null;
  public isAudioEnabled = true;
  private lastSoundTime = 0;
  private soundDebounceTime = 200; // 200ms debounce

  // Initialize steps dynamically based on available filters
  private initializeSteps(): void {
    this.updateSteps();
    // Initialize ninja position to step 1 (rightmost)
    setTimeout(() => {
      this.moveNinjaToStep(0, false);
    }, 100);
  }

  // Update steps array when filters change
  private updateSteps(): void {
    // Create steps array from availableFilters for company data
    this.steps = [...this.availableFilters.map((filter) => filter.name)];

    // Calculate dynamic step width based on container and number of steps
    this.calculateStepWidth();
  }

  // Calculate step width dynamically
  private calculateStepWidth(): void {
    // Get the actual container width instead of window width
    const containerElement = document.querySelector('.steps');
    if (containerElement) {
      const containerWidth = containerElement.clientWidth;
      const minStepWidth = 80; // Minimum width per step
      const maxStepWidth = 150; // Maximum width per step

      // Calculate step width based on number of steps
      const calculatedWidth = containerWidth / this.steps.length;

      // Ensure step width is within reasonable bounds
      this.stepWidth = Math.max(
        minStepWidth,
        Math.min(maxStepWidth, calculatedWidth)
      );
    } else {
      // Fallback to window width if container not found
      const screenWidth = window.innerWidth;
      const containerWidth = screenWidth * 0.8 - 40;
      const minStepWidth = 80;
      const maxStepWidth = 150;
      const calculatedWidth = containerWidth / this.steps.length;
      this.stepWidth = Math.max(
        minStepWidth,
        Math.min(maxStepWidth, calculatedWidth)
      );
    }
  }

  // Initialize audio
  private initializeAudio(): void {
    try {
      this.jumpSound = new Audio('assets/sound/notification-jump.wav');
      this.jumpSound.preload = 'auto';
      this.jumpSound.volume = 0.3; // Set volume to 30%
    } catch (error) {
      console.warn('Could not initialize jump sound:', error);
      this.isAudioEnabled = false;
    }
  }

  // Play jump sound with debounce
  private playJumpSound(): void {
    if (this.isAudioEnabled && this.jumpSound) {
      const currentTime = Date.now();

      // Check if enough time has passed since last sound
      if (currentTime - this.lastSoundTime < this.soundDebounceTime) {
        return; // Skip playing sound if too soon
      }

      this.lastSoundTime = currentTime;

      try {
        this.jumpSound.currentTime = 0; // Reset to beginning
        this.jumpSound.play().catch((error) => {
          console.warn('Could not play jump sound:', error);
        });
      } catch (error) {
        console.warn('Error playing jump sound:', error);
      }
    }
  }

  // Add method to move ninja
  moveNinjaToStep(stepIndex: number, playSound: boolean = true) {
    this.currentStep = stepIndex;

    // Get the actual container width instead of window width
    const containerElement = document.querySelector('.steps');
    let containerWidth: number;

    if (containerElement) {
      containerWidth = containerElement.clientWidth;
    } else {
      // Fallback to window width if container not found
      containerWidth = window.innerWidth * 0.8;
    }

    const stepWidth = containerWidth / this.steps.length;

    // Move from right to left: start from right side and move left (like progress bar)
    const totalSteps = this.steps.length - 1;
    const rightToLeftIndex = totalSteps - stepIndex;

    // Calculate position as percentage to center the ninja on the circle
    // Each step takes up (100 / totalSteps) % of the container width
    const stepPercentage = 100 / this.steps.length;
    // Position the ninja at the center of the target step
    this.markerLeft = rightToLeftIndex * stepPercentage + stepPercentage / 2;

    // Play jump sound only if requested
    if (playSound) {
      this.playJumpSound();
    }

    // Update active connector width
    this.updateActiveConnector(stepIndex);
  }

  // Update active connector width
  private updateActiveConnector(stepIndex: number): void {
    // Get the actual container width instead of window width
    const containerElement = document.querySelector('.steps');
    let containerWidth: number;

    if (containerElement) {
      containerWidth = containerElement.clientWidth;
    } else {
      // Fallback to window width if container not found
      containerWidth = window.innerWidth - 40;
    }

    const stepWidth = containerWidth / this.steps.length;
    const activeWidth = (stepIndex + 1) * stepWidth;
    const percentage = (activeWidth / containerWidth) * 100;

    // Apply the width to the active connector
    const stepsElement = document.querySelector('.steps') as HTMLElement;
    if (stepsElement) {
      stepsElement.style.setProperty('--active-width', `${percentage}%`);
    }
  }

  // Add method to toggle filters
  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  // Add method to select option
  selectOption(index: number) {
    this.moveNinjaToStep(index);
    this.showFilters = false;
  }

  // Export methods
  exportSelectedRowsToExcel(): void {
    this.exportService.exportSelectedRows(this.selectedRows, {
      fileName: this.exportConfig.selectedFileName,
      showSpinner: this.exportConfig.showSpinner,
      spinnerMessage: this.exportConfig.spinnerMessage,
    });
  }

  exportCurrentPageToExcel(): void {
    const currentPageData = this.getCurrentPageData();
    this.exportService.exportCurrentPage(currentPageData, {
      fileName: this.exportConfig.currentPageFileName,
      showSpinner: this.exportConfig.showSpinner,
      spinnerMessage: this.exportConfig.spinnerMessage,
    });
  }

  exportAllDataToExcel(): void {
    // Always use API to get the latest data and better performance
    this.spinner.show();
    this.exportAllDataFromAPI();
  }

  // Selection event handlers for shared components
  onSelectAllChange(isChecked: boolean): void {
    if (isChecked) {
      // Select all data (not just current page)
      this.selectionService.selectAll(this.data);
    } else {
      this.selectionService.deselectAll();
    }
  }

  onRowSelectionChange(event: { row: CompanyData; selected: boolean }): void {
    if (event.selected) {
      this.selectionService.selectRow(event.row);
    } else {
      this.selectionService.deselectRow(event.row);
    }
  }

  // Helper method to get current page data
  getCurrentPageData(): CompanyData[] {
    if (this.isUsingApi) {
      // إذا كنا نستخدم API، البيانات المعروضة هي البيانات الحالية
      return this.data;
    } else {
      // إذا كنا نستخدم البيانات المحلية، نحتاج لتقطيع البيانات
      const startIndex = this.currentPage * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.data.slice(startIndex, endIndex);
    }
  }

  // Check if row is selected
  isRowSelected(row: CompanyData): boolean {
    return this.selectionService.isRowSelected(row);
  }

  // Fetch all data from API for export - Optimized for better performance
  private exportAllDataFromAPI(): void {
    // Build filter parameters (same as current filters) - Optimized for export
    const baseParams: CompanyFilterParams = {
      pageIndex: 1,
      pageSize: 10000, // Maximum page size for fastest API calls
    };

    // Add current filters to the export request
    this.addCurrentFiltersToParams(baseParams);

    // Fetch all data by making multiple API calls
    this.fetchAllDataRecursively(baseParams, [], 1);
  }

  // Add current filters to export parameters
  private addCurrentFiltersToParams(params: CompanyFilterParams): void {
    const formValue = this.filterForm.value;

    if (formValue.country) {
      params.country = formValue.country;
    }
    if (formValue.city) {
      params.city = formValue.city;
    }
    if (formValue.industry) {
      params.industryName = formValue.industry;
    }
    if (formValue.companyName) {
      params.name = formValue.companyName;
    }
    // Add other filters as needed
  }

  // Recursively fetch all data by making multiple API calls
  private fetchAllDataRecursively(
    baseParams: CompanyFilterParams,
    allData: CompanyData[],
    currentPage: number
  ): void {
    const params = { ...baseParams, pageIndex: currentPage };

    this.companyService.GetCompanies(params).subscribe({
      next: (response) => {
        if (
          response &&
          response.succeeded &&
          response.data &&
          response.data.items
        ) {
          const pageData = response.data.items;
          const totalCount = response.data.totalCount || 0;

          // Add current page data to all data
          allData.push(...pageData);

          // Calculate total pages
          const totalPages = Math.ceil(
            totalCount / (baseParams.pageSize || 10000)
          );

          if (currentPage < totalPages) {
            // Continue fetching next page
            this.fetchAllDataRecursively(baseParams, allData, currentPage + 1);
          } else {
            // All data fetched, now export
            this.spinner.hide();
            if (allData.length === 0) {
              this.notifyDialog.error({
                title: 'خطأ في التصدير',
                description: 'لا توجد بيانات للتصدير',
                autoCloseMs: 3000,
              });
            } else {
              this.exportService.exportAllData(allData, {
                fileName: this.exportConfig.allDataFileName,
                showSpinner: false, // Already showing spinner
              });
            }
          }
        } else {
          this.spinner.hide();
          if (allData.length === 0) {
            this.notifyDialog.error({
              title: 'خطأ في التصدير',
              description: 'لا توجد بيانات للتصدير',
              autoCloseMs: 3000,
            });
          } else {
            this.exportService.exportAllData(allData, {
              fileName: this.exportConfig.allDataFileName,
              showSpinner: false, // Already showing spinner
            });
          }
        }
      },
      error: (error) => {
        console.error('Error fetching data for export:', error);
        if (allData.length > 0) {
          // Export what we have so far
          this.exportService.exportAllData(allData, {
            fileName: this.exportConfig.allDataFileName,
            showSpinner: false, // Already showing spinner
          });
        } else {
          this.spinner.hide();
          this.notifyDialog.error({
            title: 'خطأ في التحميل',
            description: 'حدث خطأ أثناء تحميل البيانات للتصدير',
            autoCloseMs: 5000,
          });
        }
      },
    });
  }
}
