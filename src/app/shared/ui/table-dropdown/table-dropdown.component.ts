import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation,
} from '@angular/core';
import { StatusColorService } from '../../../core/services/common/status-color.service';

@Component({
  selector: 'app-table-dropdown',
  template: `
    <app-dropdown-container
      [selectedValue]="selectedValue"
      [placeholder]="placeholder"
      [disabled]="disabled"
      [autoSave]="autoSave"
      (valueChange)="onValueChange($event)"
      (save)="onSave($event)"
    >
      <app-dropdown-option
        *ngFor="let option of options"
        [value]="option"
        [displayText]="option"
        [isSelected]="option === selectedValue"
      ></app-dropdown-option>
    </app-dropdown-container>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class TableDropdownComponent {
  @Input() options: string[] = [];
  @Input() selectedValue: string = '';
  @Input() placeholder: string = 'اختر...';
  @Input() disabled: boolean = false;
  @Input() autoSave: boolean = false;
  @Input() optionColors: Record<string, string> = {};

  @Output() valueChange = new EventEmitter<string>();
  @Output() save = new EventEmitter<string>();

  constructor(private statusColorService: StatusColorService) {}

  onValueChange(value: string): void {
    this.selectedValue = value;
    this.valueChange.emit(value);
  }

  onSave(value: string): void {
    this.save.emit(value);
  }

  getStatusColor(option: string): string | null {
    // Use custom colors if provided, otherwise use service
    if (this.optionColors && Object.keys(this.optionColors).length > 0) {
      const normalizedOption = this.normalize(option);
      return this.optionColors[normalizedOption] || null;
    }
    return this.statusColorService.getStatusColor(option);
  }

  private normalize(value: string): string {
    return (value || '').toLowerCase().trim();
  }
}
