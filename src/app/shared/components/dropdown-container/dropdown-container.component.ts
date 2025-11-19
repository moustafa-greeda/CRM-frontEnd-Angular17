import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import { StatusColorService } from '../../../core/services/common/status-color.service';

@Component({
  selector: 'app-dropdown-container',
  template: `
    <div class="dropdown-container">
      <select
        class="dropdown-select"
        [value]="selectedValue"
        (change)="onValueChange($event)"
        [disabled]="disabled"
        [style]="getSelectedStyle()"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <ng-content></ng-content>
      </select>
    </div>
  `,
  styles: [
    `
      .dropdown-container {
        width: 100%;
        min-width: 70px;
      }

      .dropdown-select {
        width: 100%;
        min-width: 70px;
        padding: 8px 12px;
        border: 1px solid var(--primary-color);
        border-radius: 6px;
        background: rgba(17, 24, 31, 0.95);
        color: white;
        font-size: 14px;
        outline: none;
        transition: all 0.2s ease;
      }

      .dropdown-select:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(70, 227, 255, 0.2);
      }

      .dropdown-select:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: rgba(17, 24, 31, 0.5);
      }

      .dropdown-select option {
        background: rgba(17, 24, 31, 0.95);
        color: white;
        padding: 8px;
        border: none;
      }

      .dropdown-select option:disabled {
        color: #666;
        font-style: italic;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class DropdownContainerComponent {
  @Input() selectedValue: string = '';
  @Input() placeholder: string = 'اختر...';
  @Input() disabled: boolean = false;
  @Input() autoSave: boolean = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output() save = new EventEmitter<string>();

  constructor(private statusColorService: StatusColorService) {}

  onValueChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const value = target.value;
    this.selectedValue = value;
    this.valueChange.emit(value);

    // Auto-save if enabled
    if (this.autoSave) {
      this.save.emit(value);
    }
  }

  getSelectedStyle(): Record<string, string> | null {
    const color = this.statusColorService.getStatusColor(this.selectedValue);
    return color ? { 'border-color': color } : null;
  }
}
