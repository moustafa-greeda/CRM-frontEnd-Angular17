import {
  Component,
  input,
  output,
  signal,
  computed,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusColorService } from '../../../core/services/common/status-color.service';

/**
 * 🎯 Table Dropdown Component
 *  * 
 * @example
 * ```html
 * <app-table-dropdown
 *   [options]="['Active', 'Inactive', 'Pending']"
 *   [selectedValue]="row.status"
 *   [placeholder]="'Select Status'"
 *   [autoSave]="true"
 *   (valueChange)="onStatusChange($event)"
 *   (save)="onSave($event)"
 * />
 * ```
 */
@Component({
  selector: 'app-table-dropdown',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="dropdown-container">
      <select
        class="dropdown-select"
        [value]="selectedValue()"
        [disabled]="disabled()"
        [style]="selectedStyle()"
        (change)="onValueChange($event)"
      >
        <option value="" disabled>{{ placeholder() }}</option>
        @for(option of options(); track option) {
          <option
            [value]="option"
            [selected]="option === selectedValue()"
            [style]="getOptionStyle(option)"
          >
            {{ option }}
          </option>
        }
      </select>
    </div>
  `,
  styles: [`
    /* ===================== Container ===================== */
    .dropdown-container {
      width: 100%;
      min-width: 70px;
      position: relative;
    }

    /* ===================== Select Element ===================== */
    .dropdown-select {
      width: 100%;
      min-width: 70px;
      padding: 8px;
      border: 1px solid var(--primary-color);
      border-radius: 6px;
      background: rgba(17, 24, 31, 0.95);
      color: white;
      font-size: 12px;
      font-weight: 500;
      outline: none;
      cursor: pointer;
      transition: all 0.2s ease;
      appearance: auto;
      -webkit-appearance: auto;
      -moz-appearance: auto;
      background-image: none;
    }

    /* ===================== Focus State ===================== */
    .dropdown-select:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(70, 227, 255, 0.2);
    }

    /* ===================== Hover State ===================== */
    .dropdown-select:hover:not(:disabled) {
      border-color: var(--secondary-color);
      box-shadow: 0 0 8px rgba(70, 227, 255, 0.3);
    }

    /* ===================== Disabled State ===================== */
    .dropdown-select:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background: rgba(17, 24, 31, 0.5);
    }

    /* ===================== Options ===================== */
    .dropdown-select option {
      background: rgba(17, 24, 31, 0.95);
      color: white;
      padding: 8px 12px;
      border: none;
      font-weight: 500;
    }

    .dropdown-select option:hover {
      background: rgba(70, 227, 255, 0.1);
    }

    .dropdown-select option:checked {
      background: rgba(70, 227, 255, 0.2);
      font-weight: 600;
    }

    .dropdown-select option:disabled {
      color: #666;
      font-style: italic;
      cursor: not-allowed;
    }

    /* ===================== Status Colors ===================== */
    .dropdown-select[data-status="active"],
    .dropdown-select[data-status="نشط"] {
      border-color: #00ff7f;
    }

    .dropdown-select[data-status="inactive"],
    .dropdown-select[data-status="غير نشط"] {
      border-color: #ff6b6b;
    }

    .dropdown-select[data-status="pending"],
    .dropdown-select[data-status="قيد الانتظار"] {
      border-color: #ffd700;
    }
  `],
})
export class TableDropdownComponent {
  /* ===================== SERVICES ===================== */
  private readonly statusColorService = inject(StatusColorService);

  /* ===================== INPUTS ===================== */
  readonly options = input<string[]>([]);
  readonly selectedValue = input<string>('');
  readonly placeholder = input<string>('اختر...');
  readonly disabled = input<boolean>(false);
  readonly autoSave = input<boolean>(false);
  readonly optionColors = input<Record<string, string>>({});

  /* ===================== OUTPUTS ===================== */
  readonly valueChange = output<string>();
  readonly save = output<string>();

  /* ===================== STATE ===================== */
  private readonly _selectedValue = signal<string>('');

  /* ===================== COMPUTED ===================== */
  readonly selectedStyle = computed(() => {
    const value = this.selectedValue();
    const color = this.getStatusColor(value);
    
    return color 
      ? { 
        'border-radius': '12px',
        'background-color': color,
          'border-color': color,
          'box-shadow': `0 0 12px ${color} 40`
        } 
      : null;
  });

  readonly hasOptions = computed(() => this.options().length > 0);

  /* ===================== METHODS ===================== */

  /**
   * Handle value change
   */
  onValueChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;

    if (!value) return;

    this._selectedValue.set(value);
    this.valueChange.emit(value);

    // Auto-save if enabled
    if (this.autoSave()) {
      this.save.emit(value);
    }
  }

  /**
   * Get status color for the selected value
   */
  private getStatusColor(value: string): string | null {
    // Use custom colors if provided
    const customColors = this.optionColors();
    if (customColors && Object.keys(customColors).length > 0) {
      const normalizedValue = this.normalize(value);
      const color = customColors[normalizedValue];
      if (color) return color;
    }

    // Fallback to service
    return this.statusColorService.getStatusColor(value);
  }

  /**
   * Get option style based on status color
   */
  getOptionStyle(option: string): Record<string, string> | null {
    const color = this.getStatusColor(option);
    
    if (!color) return null;

    return {
      'color': this.statusColorService.getContrastTextColor(color),
      'border': 'none',
      'font-weight': '500',
    };
  }

  /**
   * Normalize string for comparison
   */
  private normalize(value: string): string {
    return (value || '').toLowerCase().trim();
  }
}
