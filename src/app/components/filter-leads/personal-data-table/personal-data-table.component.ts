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
  jobTitles: any[] = [];
  jobLevels: any[] = [];
  industries: any[] = [];
  comapnySize: any[] = [];


  // Filter button functionality
  showFilterButtons = true;
  selectedFilters: any[] = [];
  filtersExecuted = false; // Track if filters have been executed - starts as false to show background image
  
  // Age slider properties
  ageSliderValue = 18;
  minAge = 18;
  maxAge = 70;
  showAgeSlider = false;
  
  // Location dropdown visibility
  showCountryDropdown = false;
  showCityDropdown = false;
  showJobTitleDropdown = false;
  showJobLevelDropdown = false;
  showIndustryDropdown = false;
  showComapnySizeDropdown = false;
  
  availableFilters = [
    { id: 'personality', name: 'الشخصية', type: 'select', options: ['USER', 'ADMIN', 'MANAGER', 'EMPLOYEE'] },
    // { id: 'customerLevel', name: 'مستوى العميل', type: 'select', options: ['NEW', 'EXISTING', 'VIP', 'PREMIUM'] },
    { id: 'customerType', name: 'نوع العميل', type: 'select', options: ['B2B', 'B2C', 'ENTERPRISE'] },
    { id: 'language', name: 'اللغة', type: 'select', options: ['العربية', 'English', 'Français'] },
    { id: 'department', name: 'القسم', type: 'select', options: ['IT', 'HR', 'Finance', 'Marketing', 'Sales'] },
    { id: 'age', name: 'العمر', type: 'select', options: ['18-25', '26-35', '36-45', '46-55', '55+'] }
  ];

  // Icon mapping for filter buttons
  getFilterIcon(filterId: string): string {
    const iconMap: { [key: string]: string } = {
      'personality': 'person',
      'customerType': 'category',
      'language': 'language',
      'department': 'business_center',
      'age': 'cake'
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
    this.getJobTitle();
    this.getJobLevel();
    this.getIndustry();
    this.getComapnySize();
    this.initializeSteps();
    this.initializeAudio();
    
    // Listen for window resize to recalculate step width
    window.addEventListener('resize', () => {
      this.calculateStepWidth();
      this.moveNinjaToStep(this.currentStep); // Recalculate current position
    });
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
      comapnySize: [''],
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
          item.jobTitle,
          item.jobLevel,
          item.industry,
          item.comapnySize,
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
      if (filters.jobTitle && !item.jobTitle?.toLowerCase().includes(filters.jobTitle.toLowerCase())) return false;
      if (filters.jobLevel && item.jobLevel !== filters.jobLevel) return false;
      // Age range filter
      if (filters.ageRange) {
        const ageRange = this.ageRanges.find(range => range.label === filters.ageRange);
        if (ageRange && item.age && (item.age < ageRange.min || item.age > ageRange.max)) return false;      }

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
      // Update steps and recalculate width when filters change
      this.updateSteps();
    }
    // this.showFilterButtons = false;
  }

  removeFilter(filterId: string) {
    this.selectedFilters = this.selectedFilters.filter(f => f.id !== filterId);
    // Update steps and recalculate width when filters change
    this.updateSteps();
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
    this.showJobTitleDropdown = false;
    this.showJobLevelDropdown = false;
    this.showIndustryDropdown = false;
    this.showComapnySizeDropdown = false;
    this.countryId = 0;
    this.cities = [];
    this.filterForm.reset();
    this.updateSteps();
    // إعادة النينجا للموضع الافتراضي (الخطوة 1)
    this.moveNinjaToStep(0);
    // Reset filters executed flag
    this.filtersExecuted = false;
  }

  // Toggle audio on/off
  toggleAudio(): void {
    this.isAudioEnabled = !this.isAudioEnabled;
    console.log('Audio enabled:', this.isAudioEnabled);
  }

  hasActiveFilters(): boolean {
    return this.selectedFilters.length > 0 || 
           this.showCountryDropdown || 
           this.showCityDropdown || 
           this.showJobTitleDropdown || 
           this.showJobLevelDropdown||
           this.showIndustryDropdown||
           this.showComapnySizeDropdown;
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

    // Apply job title filter
    if (this.showJobTitleDropdown) {
      const jobTitleSelect = document.querySelector('.job-title-dropdown') as HTMLSelectElement;
      if (jobTitleSelect && jobTitleSelect.value) {
        const selectedJobTitle = this.jobTitles.find(jt => jt.id == jobTitleSelect.value);
        if (selectedJobTitle) {
          this.filterForm.patchValue({ jobTitle: selectedJobTitle.name });
        }
      }
    }

    // Apply job level filter
    if (this.showJobLevelDropdown) {
      const jobLevelSelect = document.querySelector('.job-level-dropdown') as HTMLSelectElement;
      if (jobLevelSelect && jobLevelSelect.value) {
        const selectedJobLevel = this.jobLevels.find(jl => jl.id == jobLevelSelect.value);
        if (selectedJobLevel) {
          this.filterForm.patchValue({ jobLevel: selectedJobLevel.name });
        }
      }
    }
    // Apply industry filter
      if (this.showIndustryDropdown) {
        const industrySelect = document.querySelector('.industry-dropdown') as HTMLSelectElement;
        if (industrySelect && industrySelect.value) {
          const selectedIndustry = this.industries.find(i => i.id == industrySelect.value);
          if (selectedIndustry) {
            this.filterForm.patchValue({ industry: selectedIndustry.name });
          }
        }
      }

    // Apply company size filter
    if (this.showComapnySizeDropdown) {
      const companySizeSelect = document.querySelector('.comapny-size-dropdown') as HTMLSelectElement;
      if (companySizeSelect && companySizeSelect.value) {
        const selectedCompanySize = this.comapnySize.find(cs => cs.id == companySizeSelect.value);
        if (selectedCompanySize) {
          this.filterForm.patchValue({ comapnySize: selectedCompanySize.sizeName });
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
    
    // Mark filters as executed
    this.filtersExecuted = true;
  }

  // ================================= Country  methods ===============================
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
  // ==================================== City methods ===================================
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

  // ==================================== Job Title methods ===================================
  getJobTitle() {
    this.personalService.GetJobTitle().subscribe({
      next: (res) => {
        this.jobTitles = res.data || [];
        console.log('Job titles loaded in personal table:', this.jobTitles);
      },
      error: (error) => {
        console.error('Error loading job titles:', error);
        this.jobTitles = [];
      }
    });
  }

  // ==================================== Job Level methods ===================================
  getJobLevel() {
    this.personalService.GetJobLevel().subscribe({
      next: (res) => {
        this.jobLevels = res.data || [];
        console.log('Job levels loaded in personal table:', this.jobLevels);
      },
      error: (error) => {
        console.error('Error loading job levels:', error);
        this.jobLevels = [];
      }
    });
  }
    // ==================================== GetIndustry methods ===================================
  getIndustry() {
    this.personalService.GetIndustry().subscribe({
      next: (res) => {
        this.industries = res.data || [];
        console.log('Industries loaded in personal table:', this.industries);
      },
      error: (error)=>{
        console.error('Error loading industries:', error);
        this.industries = [];
      }
    });
  }
    // ==================================== GetIndustry methods ===================================
  getComapnySize() {
    this.personalService.GetComapnySize().subscribe({
      next: (res) => {
        this.comapnySize = res.data || [];
        console.log('Comapny sizes loaded in personal table:', this.comapnySize);
      },      error: (error)=>{
        console.error('Error loading comapny sizes:', error);
        this.comapnySize = [];
      }
    });
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
  toggleComapnySizeDropdown() {
    this.showComapnySizeDropdown = !this.showComapnySizeDropdown;
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
    const jobLevel = this.jobLevels.find(jl => jl.id == selectedJobLevel);
    if (jobLevel) {
      this.filterForm.patchValue({ jobLevel: jobLevel.name });
    }
  }
}

// Industry change handler
onIndustryChange(event: any) {
  const selectedIndustry = event.target.value;
  if (selectedIndustry) {
    const industry = this.industries.find(i => i.id == selectedIndustry);
    if (industry) {
      this.filterForm.patchValue({ industry: industry.name });
    }
  }
}

// Comapny Size change handler
onComapnySizeChange(event: any) {
  const selectedComapnySize = event.target.value;
  if (selectedComapnySize) {
    const comapnySize = this.comapnySize.find(cs => cs.id == selectedComapnySize);
    if (comapnySize) {
      this.filterForm.patchValue({ comapnySize: comapnySize.name });
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

// Initialize steps dynamically based on available filters
private initializeSteps(): void {
  this.updateSteps();
  // Initialize ninja position to step 1 (rightmost)
  setTimeout(() => {
    this.moveNinjaToStep(0);
  }, 100);
}

// Update steps array when filters change
private updateSteps(): void {
  // Create steps array from availableFilters and additional dropdown filters
  this.steps = [
    ...this.availableFilters.map(filter => filter.name),
    'الدولة',
    'المدينة', 
    'المسمى الوظيفي',
    'مستوى الوظيفة',
    'الصناعة',
    'حجم الشركة'
  ];
  
  // Calculate dynamic step width based on container and number of steps
  this.calculateStepWidth();
}

// Calculate step width dynamically
private calculateStepWidth(): void {
  const screenWidth = window.innerWidth;
  const containerWidth = (screenWidth * 0.8) - 40; // 80% width minus padding
  const minStepWidth = 80; // Minimum width per step
  const maxStepWidth = 150; // Maximum width per step
  
  // Calculate step width based on number of steps
  const calculatedWidth = containerWidth / this.steps.length;
  
  // Ensure step width is within reasonable bounds
  this.stepWidth = Math.max(minStepWidth, Math.min(maxStepWidth, calculatedWidth));
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

// Play jump sound
private playJumpSound(): void {
  if (this.isAudioEnabled && this.jumpSound) {
    try {
      this.jumpSound.currentTime = 0; // Reset to beginning
      this.jumpSound.play().catch(error => {
        console.warn('Could not play jump sound:', error);
      });
    } catch (error) {
      console.warn('Error playing jump sound:', error);
    }
  }
}

// Add method to move ninja
moveNinjaToStep(stepIndex: number) {
  this.currentStep = stepIndex;
  
  // Calculate marker position from right to left
  const containerWidth = window.innerWidth * 0.8; // 80% width like container-steps
  const stepWidth = containerWidth / this.steps.length;
  
  // Move from right to left: start from right side and move left
  const totalSteps = this.steps.length - 1;
  const rightToLeftIndex = totalSteps - stepIndex;
  this.markerLeft = (rightToLeftIndex * stepWidth) + (stepWidth / 2) - 55; // Center the marker
  
  console.log('Moving ninja to step:', stepIndex, 'rightToLeftIndex:', rightToLeftIndex, 'markerLeft:', this.markerLeft, 'currentStep:', this.currentStep);
  
  // Play jump sound
  this.playJumpSound();
  
  // Update active connector width
  this.updateActiveConnector(stepIndex);
}

// Update active connector width
private updateActiveConnector(stepIndex: number): void {
  const containerWidth = window.innerWidth - 40;
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
    this.moveNinjaToStep(4); // Move ninja to age step
  }
}

onAgeSliderChange(event: any) {
  this.ageSliderValue = event.target.value;
  this.updateAgeFilter();
}

updateAgeFilter() {
  // Update the form with the selected age
  this.filterForm.patchValue({
    ageRange: this.ageSliderValue.toString()
  });
  this.executeFilters();
}

getAgeDisplayText(): string {
  return `العمر: ${this.ageSliderValue} سنة`;
}
} 
