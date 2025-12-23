import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
} from '@angular/core';

@Component({
  selector: 'app-pagination-card',
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css',
})
export class PaginationComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 0;
  @Input() isLoading: boolean = false;
  @Input() showWhenLoading: boolean = false; // Show pagination even when loading

  @Output() pageChange = new EventEmitter<number>();

  // Computed property for page numbers to display
  get pageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Check if pagination should be shown
  get shouldShow(): boolean {
    return (
      !this.isLoading &&
      this.totalPages > 1 &&
      (this.showWhenLoading || !this.isLoading)
    );
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  goToFirstPage(): void {
    this.onPageChange(1);
  }

  goToLastPage(): void {
    this.onPageChange(this.totalPages);
  }

  goToPreviousPage(): void {
    this.onPageChange(this.currentPage - 1);
  }

  goToNextPage(): void {
    this.onPageChange(this.currentPage + 1);
  }
}
