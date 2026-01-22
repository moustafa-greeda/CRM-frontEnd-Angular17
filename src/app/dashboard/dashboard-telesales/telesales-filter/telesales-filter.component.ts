import { Component, input, output, signal, computed, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchInputComponent } from '../../../shared/ui/search-input/search-input.component';
import { DropdownComponent } from '../../../shared/ui/dropdown/dropdown.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-telesales-filter',
  standalone: true,
  imports: [
    CommonModule,
    SearchInputComponent,
    DropdownComponent,
    ButtonComponent,
  ],
  templateUrl: './telesales-filter.component.html',
  styleUrls: ['./telesales-filter.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TelesalesFilterComponent {
  // Inputs
  readonly searchPlaceholder = input<string>('ابحث عن العملاء');
  readonly listLeadStatus = input<string[]>([]);
  readonly countryNames = input<string[]>([]);
  readonly cityNames = input<string[]>([]);
  readonly actionDateFilterLabels = input<string[]>([]);
  
  // Current filter values
  readonly searchTerm = input<string>('');
  readonly selectedLeadStatusName = input<string>('');
  readonly selectedCountry = input<string>('');
  readonly selectedCity = input<string>('');
  readonly selectedActionDateFilter = input<number | null>(null);

  // Outputs
  readonly searchChange = output<string>();
  readonly leadStatusChange = output<string>();
  readonly countryChange = output<string>();
  readonly cityChange = output<string>();
  readonly actionDateFilterChange = output<any>();
  readonly resetFilters = output<void>();

  // Computed
  readonly cityDropdownLabel = computed(() => 
    this.selectedCountry() ? 'اختر المدينة' : 'يجب اختيار الدولة أولاً'
  );

  readonly hasActiveFilters = computed(() => 
    !!(
      this.searchTerm() ||
      this.selectedCountry() ||
      this.selectedCity() ||
      this.selectedActionDateFilter() !== null ||
      this.selectedLeadStatusName()
    )
  );

  readonly isCityDisabled = computed(() => !this.selectedCountry());

  // Methods
  onSearch(event: any): void {
    const value = event.target?.value || event;
    this.searchChange.emit(value);
  }

  onLeadStatusSelected(option: string): void {
    this.leadStatusChange.emit(option);
  }

  onCountrySelected(option: string): void {
    this.countryChange.emit(option);
  }

  onCitySelected(option: string): void {
    this.cityChange.emit(option);
  }

  onActionDateFilterSelected(option: string): void {
    this.actionDateFilterChange.emit(option);
  }

  onReset(): void {
    this.resetFilters.emit();
  }
}
