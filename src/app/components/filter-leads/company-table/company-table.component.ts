import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, startWith, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CompanyData } from '../shared/interfaces';

@Component({
  selector: 'app-company-table',
  templateUrl: './company-table.component.html',
  styleUrls: ['./company-table.component.css']
})
export class CompanyTableComponent implements OnInit {
  @Input() data: CompanyData[] = [];
  @Output() filteredDataChange = new EventEmitter<CompanyData[]>();
  @Output() selectedRowsChange = new EventEmitter<CompanyData[]>();

  filterForm!: FormGroup;
  filteredData$!: Observable<CompanyData[]>;
  selectedRows: CompanyData[] = [];
  isAllSelected = false;

  // Filter button functionality
  showFilterButtons = false;
  selectedFilters: any[] = [];
  availableFilters = [
    { id: 'digitalTransactions', name: 'التعاملات الرقمية', type: 'select', options: ['منخفض', 'متوسط', 'عالي', 'ممتاز'] },
    { id: 'branches', name: 'عدد الفروع', type: 'text', placeholder: 'أدخل عدد الفروع' },
    { id: 'ownership', name: 'نوع الملكية', type: 'select', options: ['عامة', 'خاصة', 'مختلطة', 'حكومية'] },
    { id: 'location', name: 'الموقع', type: 'text', placeholder: 'أدخل الموقع' },
    { id: 'companyStage', name: 'مرحلة الشركة', type: 'select', options: ['ناشئة', 'نامية', 'مستقرة', 'متقدمة', 'راسخة'] },
    { id: 'size', name: 'الحجم', type: 'select', options: ['صغيرة (1-10)', 'متوسطة صغيرة (11-50)', 'متوسطة (51-200)', 'كبيرة (201-1000)', 'كبيرة جداً (1000+)'] },
    { id: 'industry', name: 'الصناعة', type: 'text', placeholder: 'أدخل الصناعة' },
    { id: 'companyName', name: 'اسم الشركة', type: 'text', placeholder: 'أدخل اسم الشركة' }
  ];

  // Filter options
  digitalTransactionOptions = ['منخفض', 'متوسط', 'عالي', 'ممتاز'];
  ownershipOptions = ['عامة', 'خاصة', 'مختلطة', 'حكومية'];
  companyStageOptions = ['ناشئة', 'نامية', 'مستقرة', 'متقدمة', 'راسخة'];
  sizeOptions = [
    'صغيرة (1-10)',
    'متوسطة صغيرة (11-50)',
    'متوسطة (51-200)',
    'كبيرة (201-1000)',
    'كبيرة جداً (1000+)'
  ];
  industryOptions = ['تجزئة', 'تصنيع', 'خدمات', 'تقنية', 'مالية', 'رعاية صحية', 'تعليم', 'عقارات'];

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit() {
    this.setupFiltering();
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      digitalTransactions: [''],
      branches: [''],
      ownership: [''],
      location: [''],
      companyStage: [''],
      size: [''],
      industry: [''],
      companyName: ['']
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

  private applyFilters(data: CompanyData[], filters: any): CompanyData[] {
    return data.filter(item => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableFields = [
          item.digitalTransactions,
          item.ownership,
          item.location,
          item.companyStage,
          item.size,
          item.industry,
          item.companyName
        ];
        
        if (!searchableFields.some(field => 
          field?.toLowerCase().includes(searchTerm)
        )) {
          return false;
        }
      }

      // Individual filters
      if (filters.digitalTransactions && item.digitalTransactions !== filters.digitalTransactions) return false;
      if (filters.ownership && item.ownership !== filters.ownership) return false;
      if (filters.location && !item.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.companyStage && item.companyStage !== filters.companyStage) return false;
      if (filters.size && item.size !== filters.size) return false;
      if (filters.industry && item.industry !== filters.industry) return false;
      if (filters.companyName && !item.companyName.toLowerCase().includes(filters.companyName.toLowerCase())) return false;

      // Branches filter (range)
      if (filters.branches) {
        const branchValue = parseInt(filters.branches);
        if (item.branches !== branchValue) return false;
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
      this.selectedRows = this.selectedRows.filter(item => item.id !== row.id);
    }
    this.isAllSelected = this.selectedRows.length === this.data.length;
    this.selectedRowsChange.emit(this.selectedRows);
  }

  isRowSelected(row: CompanyData): boolean {
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
    this.showFilterButtons = false;
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
  }
}
