import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith, debounceTime } from 'rxjs/operators';
import { PersonalData } from '../model/interfaces';
import {
  PersonalServiceService,
  ContactFilterParams,
} from './personal-service.service';
import { NotifyDialogService } from '../../../shared/notify-dialog/notify-dialog.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { TableExportService } from '../shared/table-export.service';
import { TableSelectionService } from '../shared/table-selection.service';

@Component({
  selector: 'app-personal-data-table',
  templateUrl: './personal-data-table.component.html',
  styleUrls: ['./personal-data-table.component.css'],
})
export class PersonalDataTableComponent implements OnInit, AfterViewInit {
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
  jobTitles: any[] = [];
  jobLevels: any[] = [];
  industries: any[] = [];

  // Filter button functionality
  showFilterButtons = true;
  selectedFilters: any[] = [];
  filtersExecuted = false; // Track if filters have been executed - starts as false to show background image
  showDataTable = false; // Control whether to show data table
  hasNoData = false; // Track if there are no results

  // Age slider properties
  ageSliderValue = 18;
  minAge = 18;
  maxAge = 70;
  showAgeSlider = false;

  // Age range properties
  ageFrom = 18;
  ageTo = 70;
  useAgeRange = false;

  // Location dropdown visibility
  showCountryDropdown = false;
  showCityDropdown = false;
  showJobTitleDropdown = false;
  showJobLevelDropdown = false;
  showIndustryDropdown = false;

  // Paginator properties
  totalCount$ = new BehaviorSubject<number>(0);
  currentPage = 0;
  pageSize = 10;

  // API data properties
  apiData$ = new BehaviorSubject<PersonalData[]>([]);
  isUsingApi = false;

  // Export configuration
  exportConfig = {
    showSelectedExport: true,
    showCurrentPageExport: true,
    showAllDataExport: true,
    selectedFileName: 'البيانات المحددة',
    currentPageFileName: 'صفحة البيانات الحالية',
    allDataFileName: 'جميع البيانات',
    showSpinner: true,
    spinnerMessage: 'جاري التصدير...',
  };

  availableFilters = [
    {
      id: 'personality',
      name: 'الشخصية',
      type: 'select',
      options: ['USER', 'ADMIN', 'MANAGER', 'EMPLOYEE'],
    },
    {
      id: 'customerType',
      name: 'نوع العميل',
      type: 'select',
      options: ['B2B', 'B2C', 'ENTERPRISE'],
    },
    {
      id: 'language',
      name: 'اللغة',
      type: 'select',
      options: ['العربية', 'English', 'Français'],
    },
    {
      id: 'department',
      name: 'القسم',
      type: 'select',
      options: ['IT', 'HR', 'Finance', 'Marketing', 'Sales'],
    },
  ];

  // Icon mapping for filter buttons
  getFilterIcon(filterId: string): string {
    const iconMap: { [key: string]: string } = {
      personality: 'person',
      customerType: 'category',
      language: 'language',
      department: 'business_center',
      age: 'cake',
    };
    return iconMap[filterId] || 'filter_list';
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

  // Filter options
  personalityOptions = ['USER', 'ADMIN', 'MANAGER', 'EMPLOYEE'];
  // customerLevelOptions = ['NEW', 'EXISTING', 'VIP', 'PREMIUM'];
  customerTypeOptions = ['B2B', 'B2C', 'ENTERPRISE'];
  languageOptions = ['العربية', 'English', 'Français'];
  departmentOptions = ['IT', 'HR', 'Finance', 'Marketing', 'Sales'];
  ageRanges = [
    { label: '18-25', min: 18, max: 25 },
    { label: '26-35', min: 26, max: 35 },
    { label: '36-45', min: 36, max: 45 },
    { label: '46-55', min: 46, max: 55 },
    { label: '55+', min: 55, max: 100 },
  ];

  constructor(
    private fb: FormBuilder,
    private personalService: PersonalServiceService,
    private notifyDialog: NotifyDialogService,
    private spinner: NgxSpinnerService,
    private exportService: TableExportService,
    private selectionService: TableSelectionService<PersonalData>
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.setupFiltering();
    this.setupSelectionService();
    this.getCountries();
    this.getJobTitle();
    this.getJobLevel();
    this.getIndustry();
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
      personality: [''],
      customerLevel: [''],
      customerType: [''],
      language: [''],
      department: [''],
      ageRange: [''],
      jobTitle: [''],
      jobLevel: [''],
      industry: [''],
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

  private applyFilters(data: PersonalData[], filters: any): PersonalData[] {
    return data.filter((item) => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableFields = [
          item.name,
          item.jobTitle,
          item.prefaredLanguage,
          item.email,
          item.phone,
          // Backward compatibility fields
          item.personality,
          item.customerLevel,
          item.customerType,
          item.language,
          item.department,
          item.jobLevel,
          item.industry,
        ];

        if (
          !searchableFields.some((field) =>
            field?.toLowerCase().includes(searchTerm)
          )
        ) {
          return false;
        }
      }

      // Individual filters
      if (filters.personality && item.personality !== filters.personality)
        return false;
      if (filters.customerLevel && item.customerLevel !== filters.customerLevel)
        return false;
      if (filters.customerType && item.customerType !== filters.customerType)
        return false;
      if (filters.language && item.language !== filters.language) return false;
      if (filters.department && item.department !== filters.department)
        return false;
      if (
        filters.jobTitle &&
        !item.jobTitle?.toLowerCase().includes(filters.jobTitle.toLowerCase())
      )
        return false;
      if (filters.jobLevel && item.jobLevel !== filters.jobLevel) return false;
      // Age range filter
      if (filters.ageRange) {
        const ageRange = this.ageRanges.find(
          (range) => range.label === filters.ageRange
        );
        if (
          ageRange &&
          item.age &&
          (item.age < ageRange.min || item.age > ageRange.max)
        )
          return false;
      }

      return true;
    });
  }

  clearFilters(): void {
    this.filterForm.reset();
  }

  getActiveFiltersCount(): number {
    let count = 0;

    // Count selected filters
    count += this.selectedFilters.length;

    // Count active dropdown filters
    if (this.showCountryDropdown) count++;
    if (this.showCityDropdown) count++;
    if (this.showJobTitleDropdown) count++;
    if (this.showJobLevelDropdown) count++;
    if (this.showIndustryDropdown) count++;
    if (this.showAgeSlider) count++;

    return count;
  }

  toggleFilterButtons(): void {
    this.showFilterButtons = !this.showFilterButtons;
  }

  addFilter(filterId: string) {
    const filter = this.availableFilters.find((f) => f.id === filterId);
    if (filter && !this.selectedFilters.find((f) => f.id === filterId)) {
      this.selectedFilters.push({
        ...filter,
        value: '',
        isActive: true,
      });
      // Update steps and recalculate width when filters change
      this.updateSteps();
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
    this.showJobTitleDropdown = false;
    this.showJobLevelDropdown = false;
    this.showIndustryDropdown = false;
    this.showAgeSlider = false;
    this.countryId = 0;
    this.cities = [];
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
      this.showAgeSlider
    );
  }

  executeFilters() {
    // بناء معاملات البحث
    const filterParams: ContactFilterParams = {
      pageIndex: this.currentPage + 1, // API يستخدم 1-based indexing
      pageSize: this.pageSize,
    };

    // إضافة فلتر العمر
    if (this.showAgeSlider) {
      if (this.useAgeRange) {
        // استخدام نطاق العمر
        if (this.ageFrom !== undefined && this.ageTo !== undefined) {
          filterParams.ageFrom = this.ageFrom;
          filterParams.ageTo = this.ageTo;
        }
      } else {
        // استخدام عمر واحد
        if (this.ageSliderValue !== undefined) {
          filterParams.ageFrom = this.ageSliderValue;
          filterParams.ageTo = this.ageSliderValue;
        }
      }
    }

    // إضافة فلتر الدولة
    if (this.showCountryDropdown && this.countryId) {
      const selectedCountry = this.countries.find(
        (c) => c.id == this.countryId
      );
      if (selectedCountry) {
        filterParams.country = selectedCountry.name;
        this.filterForm.patchValue({ country: selectedCountry.name });
      }
    }

    // إضافة فلتر المدينة
    if (this.showCityDropdown && this.cities.length > 0) {
      const citySelect = document.querySelector(
        '.city-dropdown'
      ) as HTMLSelectElement;
      if (citySelect && citySelect.value) {
        const selectedCity = this.cities.find((c) => c.id == citySelect.value);
        if (selectedCity) {
          filterParams.city = selectedCity.name; // إرسال اسم المدينة بدلاً من ID
          this.filterForm.patchValue({ city: selectedCity.name });
        }
      }
    }

    // إضافة فلتر المسمى الوظيفي
    if (this.showJobTitleDropdown) {
      const jobTitleSelect = document.querySelector(
        '.job-title-dropdown'
      ) as HTMLSelectElement;
      if (jobTitleSelect && jobTitleSelect.value) {
        const selectedJobTitle = this.jobTitles[parseInt(jobTitleSelect.value)];
        if (selectedJobTitle) {
          filterParams.jobTitle = selectedJobTitle;
          this.filterForm.patchValue({ jobTitle: selectedJobTitle });
        }
      }
    }

    // إضافة فلتر مستوى الوظيفة
    if (this.showJobLevelDropdown) {
      const jobLevelSelect = document.querySelector(
        '.job-level-dropdown'
      ) as HTMLSelectElement;
      if (jobLevelSelect && jobLevelSelect.value) {
        const selectedJobLevel = this.jobLevels.find(
          (jl) => jl.id == jobLevelSelect.value
        );
        if (selectedJobLevel) {
          filterParams.jobLevel = selectedJobLevel.name;
          this.filterForm.patchValue({ jobLevel: selectedJobLevel.name });
        }
      }
    }

    // إضافة فلتر الصناعة
    if (this.showIndustryDropdown) {
      const industrySelect = document.querySelector(
        '.industry-dropdown'
      ) as HTMLSelectElement;
      if (industrySelect && industrySelect.value) {
        const selectedIndustry = this.industries.find(
          (i) => i.id == industrySelect.value
        );
        if (selectedIndustry) {
          filterParams.industryId = selectedIndustry.id;
          this.filterForm.patchValue({ industry: selectedIndustry.name });
        }
      }
    }

    // إضافة الفلاتر الأخرى
    this.selectedFilters.forEach((filter) => {
      if (filter.value) {
        this.filterForm.patchValue({ [filter.id]: filter.value });
      }
    });

    // طباعة المعاملات النهائية

    // استدعاء API مع المعاملات
    this.personalService.GetContacts(filterParams).subscribe({
      next: (response) => {
        if (
          response &&
          response.succeeded &&
          response.data &&
          response.data.items &&
          response.data.items.length > 0
        ) {
          // تحديث البيانات من API
          this.data = response.data.items;
          this.apiData$.next(response.data.items);
          this.isUsingApi = true;
          this.setupFiltering();
          this.filtersExecuted = true;
          this.showDataTable = true; // إظهار الجدول
          this.hasNoData = false; // يوجد بيانات
          this.totalCount$.next(response.data.totalCount); // تحديث العدد الإجمالي
        } else {
          // لا توجد بيانات
          this.data = [];
          this.filtersExecuted = true;
          this.showDataTable = true; // إظهار الجدول لإظهار رسالة عدم وجود بيانات
          this.hasNoData = true; // لا يوجد بيانات
        }
      },
      error: (error) => {
        console.error('Error fetching contacts:', error);
        // في حالة الخطأ، استخدم الفلترة المحلية
        this.setupFiltering();
        this.filtersExecuted = true;
        this.showDataTable = true; // إظهار الجدول حتى في حالة الخطأ
        this.hasNoData = true; // لا يوجد بيانات في حالة الخطأ
      },
    });
  }

  // ================================= Paginator methods ===============================
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;

    // إعادة استدعاء API مع الصفحة الجديدة فقط إذا كنا نستخدم API
    if (this.isUsingApi) {
      this.executeFilters();
    }
  }

  // ================================= Country  methods ===============================
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

  // ==================================== City methods ===================================
  onCountryChange(event: any) {
    this.countryId = event.target.value;
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

  // ==================================== Job Title methods ===================================
  getJobTitle() {
    this.personalService.GetJobTitle().subscribe({
      next: (res) => {
        this.jobTitles = res.data || [];
      },
      error: (error) => {
        console.error('Error loading job titles:', error);
        this.jobTitles = [];
      },
    });
  }

  // ==================================== Job Level methods ===================================
  getJobLevel() {
    this.personalService.GetJobLevel().subscribe({
      next: (res) => {
        this.jobLevels = res.data || [];
      },
      error: (error) => {
        console.error('Error loading job levels:', error);
        this.jobLevels = [];
      },
    });
  }
  // ==================================== GetIndustry methods ===================================
  getIndustry() {
    this.personalService.GetIndustry().subscribe({
      next: (res) => {
        this.industries = res.data || [];
      },
      error: (error) => {
        console.error('Error loading industries:', error);
        this.industries = [];
      },
    });
  }

  // Toggle methods for location dropdowns
  toggleCountryDropdown() {
    this.showCountryDropdown = !this.showCountryDropdown;
    if (this.showCountryDropdown) {
      this.moveNinjaToStep(6); // Move ninja to country step (7th step, index 6)
    }
  }

  toggleCityDropdown() {
    if (this.countryId) {
      this.showCityDropdown = !this.showCityDropdown;
      // Keep both dropdowns open - don't close country dropdown
    }
  }

  // Toggle methods for job dropdowns
  toggleJobTitleDropdown() {
    this.showJobTitleDropdown = !this.showJobTitleDropdown;
  }

  toggleJobLevelDropdown() {
    this.showJobLevelDropdown = !this.showJobLevelDropdown;
  }
  toggleIndustryDropdown() {
    this.showIndustryDropdown = !this.showIndustryDropdown;
  }

  // Job Title change handler
  onJobTitleChange(event: any) {
    const selectedIndex = event.target.value;
    if (selectedIndex !== '') {
      const jobTitle = this.jobTitles[selectedIndex];
      if (jobTitle) {
        this.filterForm.patchValue({ jobTitle: jobTitle });
      }
    }
  }

  // Job Level change handler
  onJobLevelChange(event: any) {
    const selectedJobLevel = event.target.value;
    if (selectedJobLevel) {
      const jobLevel = this.jobLevels.find((jl) => jl.id == selectedJobLevel);
      if (jobLevel) {
        this.filterForm.patchValue({ jobLevel: jobLevel.name });
      }
    }
  }

  // Industry change handler
  onIndustryChange(event: any) {
    const selectedIndustry = event.target.value;
    if (selectedIndustry) {
      const industry = this.industries.find((i) => i.id == selectedIndustry);
      if (industry) {
        this.filterForm.patchValue({ industry: industry.name });
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
    // Create steps array from availableFilters and additional dropdown filters
    this.steps = [
      'الشخصية', // 1
      'نوع العميل', // 2
      'اللغة', // 3
      'القسم', // 4
      'العمر', // 5
      'الدولة', // 6
      'المدينة', // 7
      'المسمى الوظيفي', // 8
      'مستوى الوظيفة', // 9
      'الصناعة', // 10
    ];

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
      containerWidth = window.innerWidth - 100;
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

  // Age slider methods
  toggleAgeSlider() {
    this.showAgeSlider = !this.showAgeSlider;
    if (this.showAgeSlider) {
      this.moveNinjaToStep(4); // Move ninja to age step (5th step, index 4)
    }
  }

  onAgeSliderChange(event: any) {
    this.ageSliderValue = event.target.value;
    // تحديث قيم الـ inputs لتطابق الـ slider
    this.ageFrom = this.ageSliderValue;
    this.ageTo = this.ageSliderValue;
    this.updateAgeFilter();
  }

  onAgeFromChange(event: any) {
    this.ageFrom = parseInt(event.target.value);
    this.validateAgeRange();
    // تحديث الـ slider إذا كان في وضع العمر الواحد
    if (!this.useAgeRange) {
      this.ageSliderValue = this.ageFrom;
    }
    this.updateAgeRangeFilter();
  }

  onAgeToChange(event: any) {
    this.ageTo = parseInt(event.target.value);
    this.validateAgeRange();
    // تحديث الـ slider إذا كان في وضع العمر الواحد
    if (!this.useAgeRange) {
      this.ageSliderValue = this.ageTo;
    }
    this.updateAgeRangeFilter();
  }

  validateAgeRange() {
    if (this.ageFrom > this.ageTo) {
      this.ageTo = this.ageFrom;
    }
    if (this.ageFrom < this.minAge) {
      this.ageFrom = this.minAge;
    }
    if (this.ageTo > this.maxAge) {
      this.ageTo = this.maxAge;
    }
  }

  updateAgeFilter() {
    // Update the form with the selected age
    this.filterForm.patchValue({
      ageRange: this.ageSliderValue.toString(),
    });
  }

  updateAgeRangeFilter() {
    // Update the form with the selected age range
    this.filterForm.patchValue({
      ageRange: `${this.ageFrom}-${this.ageTo}`,
    });
  }

  getAgeDisplayText(): string {
    if (this.useAgeRange) {
      return `العمر: ${this.ageFrom} - ${this.ageTo} سنة`;
    }
    return `العمر: ${this.ageSliderValue} سنة`;
  }

  toggleAgeRangeMode() {
    this.useAgeRange = !this.useAgeRange;
    if (this.useAgeRange) {
      // عند التبديل إلى وضع النطاق، اجعل القيم متساوية مع الـ slider
      this.ageFrom = this.ageSliderValue;
      this.ageTo = this.ageSliderValue;
    } else {
      // عند التبديل إلى وضع العمر الواحد، اجعل الـ slider يطابق الـ from
      this.ageSliderValue = this.ageFrom;
    }
  }

  // ================================= Excel Export Methods =================================
  // ========== Select All methods ==================
  onSelectAll(event: any): void {
    this.isAllSelected = event.checked;
    if (this.isAllSelected) {
      // Select all data (not just current page)
      this.selectedRows = [...this.data];
    } else {
      this.selectedRows = [];
    }
    this.selectedRowsChange.emit(this.selectedRows);
  }

  onSelectRow(row: PersonalData, event: any): void {
    // For HTML checkboxes, use event.target.checked instead of event.checked
    const isChecked = event.target?.checked || event.checked;

    if (isChecked) {
      this.selectionService.selectRow(row);
    } else {
      this.selectionService.deselectRow(row);
    }

    this.isAllSelected = this.selectedRows.length === this.data.length;
    this.selectedRowsChange.emit(this.selectedRows);
    this.updateSelectAllCheckboxState();
  }

  isRowSelected(row: PersonalData): boolean {
    return this.selectionService.isRowSelected(row);
  }

  // Get current page data
  getCurrentPageData(): PersonalData[] {
    if (this.isUsingApi) {
      return this.apiData$.value || [];
    } else {
      // For non-API data, we need to get the current data from the component
      const allData = this.data || [];
      const startIndex = this.currentPage * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return allData.slice(startIndex, endIndex);
    }
  }

  // Export selected rows to Excel
  exportSelectedRowsToExcel(): void {
    this.exportService.exportSelectedRows(this.selectedRows, {
      fileName: this.exportConfig.selectedFileName,
      showSpinner: this.exportConfig.showSpinner,
      spinnerMessage: this.exportConfig.spinnerMessage,
    });
  }

  // Export current page to Excel
  exportCurrentPageToExcel(): void {
    const currentPageData = this.getCurrentPageData();
    this.exportService.exportCurrentPage(currentPageData, {
      fileName: this.exportConfig.currentPageFileName,
      showSpinner: this.exportConfig.showSpinner,
      spinnerMessage: this.exportConfig.spinnerMessage,
    });
  }

  // Export all data to Excel - Always use API for better performance and latest data
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

  onRowSelectionChange(event: { row: PersonalData; selected: boolean }): void {
    if (event.selected) {
      this.selectionService.selectRow(event.row);
    } else {
      this.selectionService.deselectRow(event.row);
    }
  }

  // Fetch all data from API for export - Optimized for better performance
  private exportAllDataFromAPI(): void {
    // Show loading message
    console.log('جاري تحميل جميع البيانات من الخادم...');

    // Build filter parameters (same as current filters) - Optimized for export
    const baseParams: ContactFilterParams = {
      pageIndex: 1,
      pageSize: 10000, // Maximum page size for fastest API calls
    };

    // Add current filters to the export request
    this.addCurrentFiltersToParams(baseParams);

    // Fetch all data by making multiple API calls
    this.fetchAllDataRecursively(baseParams, [], 1);
  }

  // Recursively fetch all data by making multiple API calls
  private fetchAllDataRecursively(
    baseParams: ContactFilterParams,
    allData: PersonalData[],
    currentPage: number
  ): void {
    const params = { ...baseParams, pageIndex: currentPage };

    console.log(`جاري تحميل الصفحة ${currentPage}...`);

    this.personalService.GetContacts(params).subscribe({
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

          console.log(
            `تم تحميل ${pageData.length} سجل من الصفحة ${currentPage}`
          );
          console.log(
            `إجمالي البيانات المحملة: ${allData.length} من ${totalCount}`
          );

          // Show progress percentage
          const progress = Math.round((allData.length / totalCount) * 100);
          console.log(`تقدم التحميل: ${progress}%`);

          // Check if we need to fetch more pages
          const totalPages = Math.ceil(
            totalCount / (baseParams.pageSize || 10000)
          );

          if (currentPage < totalPages) {
            // Fetch next page
            this.fetchAllDataRecursively(baseParams, allData, currentPage + 1);
          } else {
            // All data fetched, now export
            if (allData.length === 0) {
              this.spinner.hide();
              this.notifyDialog.error({
                title: 'خطأ في التصدير',
                description: 'لا توجد بيانات للتصدير',
                autoCloseMs: 3000,
              });
              return;
            }

            console.log(`تم تحميل جميع البيانات: ${allData.length} سجل`);
            this.exportService.exportAllData(allData, {
              fileName: this.exportConfig.allDataFileName,
              showSpinner: false, // Already showing spinner
            });
          }
        } else {
          if (allData.length === 0) {
            this.spinner.hide();
            this.notifyDialog.error({
              title: 'خطأ في التصدير',
              description: 'لا توجد بيانات للتصدير',
              autoCloseMs: 3000,
            });
          } else {
            // Export what we have so far
            console.log(`تم تحميل ${allData.length} سجل - جاري التصدير...`);
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
          console.log(
            `حدث خطأ أثناء التحميل - جاري تصدير ${allData.length} سجل...`
          );
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

  // Add current filter parameters to export request
  private addCurrentFiltersToParams(filterParams: ContactFilterParams): void {
    // Add age filter
    if (this.showAgeSlider) {
      if (this.useAgeRange) {
        if (this.ageFrom !== undefined && this.ageTo !== undefined) {
          filterParams.ageFrom = this.ageFrom;
          filterParams.ageTo = this.ageTo;
        }
      } else {
        if (this.ageSliderValue !== undefined) {
          filterParams.ageFrom = this.ageSliderValue;
          filterParams.ageTo = this.ageSliderValue;
        }
      }
    }

    // Add country filter
    if (this.showCountryDropdown && this.countryId) {
      const selectedCountry = this.countries.find(
        (c) => c.id == this.countryId
      );
      if (selectedCountry) {
        filterParams.country = selectedCountry.name;
      }
    }

    // Add city filter
    if (this.showCityDropdown && this.cities.length > 0) {
      const citySelect = document.querySelector(
        '.city-dropdown'
      ) as HTMLSelectElement;
      if (citySelect && citySelect.value) {
        const selectedCity = this.cities.find((c) => c.id == citySelect.value);
        if (selectedCity) {
          filterParams.city = selectedCity.name;
        }
      }
    }

    // Add job title filter
    if (this.showJobTitleDropdown) {
      const jobTitleSelect = document.querySelector(
        '.job-title-dropdown'
      ) as HTMLSelectElement;
      if (jobTitleSelect && jobTitleSelect.value) {
        const selectedJobTitle = this.jobTitles[parseInt(jobTitleSelect.value)];
        if (selectedJobTitle) {
          filterParams.jobTitle = selectedJobTitle;
        }
      }
    }

    // Add job level filter
    if (this.showJobLevelDropdown) {
      const jobLevelSelect = document.querySelector(
        '.job-level-dropdown'
      ) as HTMLSelectElement;
      if (jobLevelSelect && jobLevelSelect.value) {
        const selectedJobLevel = this.jobLevels.find(
          (jl) => jl.id == jobLevelSelect.value
        );
        if (selectedJobLevel) {
          filterParams.jobLevel = selectedJobLevel.name;
        }
      }
    }

    // Add industry filter
    if (this.showIndustryDropdown) {
      const industrySelect = document.querySelector(
        '.industry-dropdown'
      ) as HTMLSelectElement;
      if (industrySelect && industrySelect.value) {
        const selectedIndustry = this.industries.find(
          (i) => i.id == industrySelect.value
        );
        if (selectedIndustry) {
          filterParams.industryId = selectedIndustry.id;
        }
      }
    }

    // Add other filters from selectedFilters
    this.selectedFilters.forEach((filter) => {
      if (filter.value) {
        switch (filter.id) {
          case 'personality':
            filterParams.personality = filter.value;
            break;
          case 'customerType':
            filterParams.customerType = filter.value;
            break;
          case 'language':
            filterParams.language = filter.value;
            break;
          case 'department':
            filterParams.department = filter.value;
            break;
        }
      }
    });
  }

  // Update select all functionality for current page
  onSelectAllCurrentPage(event: any): void {
    // For HTML checkboxes, use event.target.checked instead of event.checked
    const isChecked = event.target?.checked || event.checked;
    console.log('Final checked state for select all:', isChecked);

    this.isAllSelected = isChecked;
    const currentPageData = this.getCurrentPageData();

    if (this.isAllSelected) {
      this.selectionService.selectAllCurrentPage(currentPageData);
    } else {
      this.selectionService.deselectAllCurrentPage(currentPageData);
    }

    this.selectedRowsChange.emit(this.selectedRows);
    this.updateSelectAllCheckboxState();
  }

  // Check if all current page rows are selected
  isAllCurrentPageSelected(): boolean {
    const currentPageData = this.getCurrentPageData();
    if (currentPageData.length === 0) return false;

    return currentPageData.every((row) =>
      this.selectedRows.some((selected) => selected.id === row.id)
    );
  }

  // Check if some (but not all) current page rows are selected
  isSomeCurrentPageSelected(): boolean {
    const currentPageData = this.getCurrentPageData();
    if (currentPageData.length === 0) return false;

    const selectedCount = currentPageData.filter((row) =>
      this.selectedRows.some((selected) => selected.id === row.id)
    ).length;

    return selectedCount > 0 && selectedCount < currentPageData.length;
  }

  // Set indeterminate state for select all checkbox
  ngAfterViewInit() {
    // Set up indeterminate state for select all checkbox
    this.updateSelectAllCheckboxState();
  }

  private updateSelectAllCheckboxState() {
    setTimeout(() => {
      const selectAllCheckbox = document.querySelector(
        '.select-all-checkbox'
      ) as HTMLInputElement;
      if (selectAllCheckbox) {
        selectAllCheckbox.indeterminate = this.isSomeCurrentPageSelected();
      }
    }, 0);
  }
}
