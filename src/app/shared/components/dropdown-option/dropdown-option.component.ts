import { Component, Input, ViewEncapsulation } from '@angular/core';
import { StatusColorService } from '../../../core/services/common/status-color.service';

@Component({
  selector: 'app-dropdown-option',
  template: `
    <option [value]="value" [selected]="isSelected" [style]="getOptionStyle()">
      {{ displayText }}
    </option>
  `,
  styles: [
    `
      option {
        padding: 8px;
        border: none;
      }

      option:hover {
        background: rgba(70, 227, 255, 0.1) !important;
      }

      option:checked {
        background: rgba(70, 227, 255, 0.2) !important;
      }
    `,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class DropdownOptionComponent {
  @Input() value: string = '';
  @Input() displayText: string = '';
  @Input() isSelected: boolean = false;
  @Input() statusColor: string | null = null;

  constructor(private statusColorService: StatusColorService) {}

  getOptionStyle(): Record<string, string> | null {
    if (this.statusColor) {
      return {
        'background-color': this.statusColor,
        color: this.statusColorService.getContrastTextColor(this.statusColor),
        border: 'none',
      };
    }
    return null;
  }
}
