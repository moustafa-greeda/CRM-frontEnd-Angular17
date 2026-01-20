import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownComponent } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-pagination-card-controls',
  standalone: true,
  imports: [CommonModule, DropdownComponent],
  template: `
    <div class="pagination-controls">
      <div class="page-size-selector">
        <label>{{ pageSizeLabel || 'عدد العناصر:' }}</label>
        <app-dropdown
          [options]="pageSizeOptionsAsStrings"
          [selectedOption]="pageSizeAsString"
          (optionSelected)="onPageSizeChange($event)"
        ></app-dropdown>
      </div>

      <div class="pagination-info">
        <span
          >{{ paginationInfoText || 'صفحة' }} {{ currentPage }}
          {{ paginationInfoText2 || 'من' }} {{ totalPages }}</span
        >
      </div>
    </div>
  `,
  styles: `
    .pagination-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(17, 24, 31, 0.85);
      border-radius: 8px;
    }

    .page-size-selector {
      min-width: 300px;
      display: flex;
      align-items: center;
      gap: 30px;
    }

    .page-size-selector label {
      text-align: center;
      font-size: 0.9rem;
      color: #6c757d;
      margin: 0;
    }

    .page-size-selector ::ng-deep .custom-dropdown {
      width: 70px !important;
      min-width: 70px !important;
    }

    .page-size-selector ::ng-deep .dropdown-trigger {
      min-width: 70px !important;
      padding: 8px 10px;
    }

    .pagination-info {
      padding: 15px;
      font-size: 0.9rem;
      color: #6c757d;
    }

    @media (max-width: 768px) {
      .pagination-controls {
        flex-direction: column;
        gap: 15px;
      }

      .page-size-selector {
        min-width: 100%;
        justify-content: space-between;
      }
    }
  `,
})
export class PaginationControlsComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [10, 50, 100, 500];
  @Input() pageSizeLabel: string = 'عدد العناصر:';
  @Input() paginationInfoText: string = 'صفحة';
  @Input() paginationInfoText2: string = 'من';

  @Output() pageSizeChange = new EventEmitter<number>();

  // Convert number[] to string[] for dropdown component
  get pageSizeOptionsAsStrings(): string[] {
    return this.pageSizeOptions.map((size) => size.toString());
  }

  // Convert number to string for dropdown component
  get pageSizeAsString(): string {
    return this.pageSize.toString();
  }

  onPageSizeChange(selectedValue: string): void {
    const newPageSize = parseInt(selectedValue, 10);
    if (!isNaN(newPageSize)) {
      this.pageSizeChange.emit(newPageSize);
    }
  }
}
