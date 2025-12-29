import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination-card-controls',
  template: `
    <div class="pagination-controls">
      <div class="page-size-selector">
        <label>{{ pageSizeLabel || 'عدد العناصر:' }}</label>
        <select (change)="onPageSizeChange($event)" [value]="pageSize">
          <option *ngFor="let size of pageSizeOptions" [value]="size">
            {{ size }}
          </option>
        </select>
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
      border: 1px solid var(--primary-color);
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

    .page-size-selector select {
      width: 100px;
      padding: 0.25rem 0.5rem;
      border: none;
      border-radius: 4px;
      color: #fff;
      background-color: var(--bg-input-focus);
      font-size: 0.9rem;
      cursor: pointer;
    }

    .page-size-selector select:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
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

  onPageSizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newPageSize = +target.value;
    this.pageSizeChange.emit(newPageSize);
  }
}
