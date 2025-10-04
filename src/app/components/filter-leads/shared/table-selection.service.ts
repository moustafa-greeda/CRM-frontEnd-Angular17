import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SelectableData {
  id?: string | number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class TableSelectionService<T extends SelectableData> {
  private selectedRowsSubject = new BehaviorSubject<T[]>([]);
  public selectedRows$ = this.selectedRowsSubject.asObservable();

  private isAllSelectedSubject = new BehaviorSubject<boolean>(false);
  public isAllSelected$ = this.isAllSelectedSubject.asObservable();

  private isSomeSelectedSubject = new BehaviorSubject<boolean>(false);
  public isSomeSelected$ = this.isSomeSelectedSubject.asObservable();

  constructor() {}

  /**
   * Get currently selected rows
   */
  getSelectedRows(): T[] {
    return this.selectedRowsSubject.value;
  }

  /**
   * Set selected rows
   */
  setSelectedRows(rows: T[]): void {
    this.selectedRowsSubject.next(rows);
    this.updateSelectionStates();
  }

  /**
   * Select all rows
   */
  selectAll(allData: T[]): void {
    this.selectedRowsSubject.next([...allData]);
    this.isAllSelectedSubject.next(true);
    this.isSomeSelectedSubject.next(false);
  }

  /**
   * Deselect all rows
   */
  deselectAll(): void {
    this.selectedRowsSubject.next([]);
    this.isAllSelectedSubject.next(false);
    this.isSomeSelectedSubject.next(false);
  }

  /**
   * Select a single row
   */
  selectRow(row: T): void {
    const currentSelection = this.selectedRowsSubject.value;
    if (!this.isRowSelected(row)) {
      this.selectedRowsSubject.next([...currentSelection, row]);
      this.updateSelectionStates();
    }
  }

  /**
   * Deselect a single row
   */
  deselectRow(row: T): void {
    const currentSelection = this.selectedRowsSubject.value;
    this.selectedRowsSubject.next(
      currentSelection.filter((item) => item.id !== row.id)
    );
    this.updateSelectionStates();
  }

  /**
   * Toggle row selection
   */
  toggleRowSelection(row: T): void {
    if (this.isRowSelected(row)) {
      this.deselectRow(row);
    } else {
      this.selectRow(row);
    }
  }

  /**
   * Check if a row is selected
   */
  isRowSelected(row: T): boolean {
    return this.selectedRowsSubject.value.some((item) => item.id === row.id);
  }

  /**
   * Check if all rows are selected
   */
  isAllSelected(totalRows: number): boolean {
    return this.selectedRowsSubject.value.length === totalRows && totalRows > 0;
  }

  /**
   * Check if some (but not all) rows are selected
   */
  isSomeSelected(totalRows: number): boolean {
    const selectedCount = this.selectedRowsSubject.value.length;
    return selectedCount > 0 && selectedCount < totalRows;
  }

  /**
   * Select all rows on current page
   */
  selectAllCurrentPage(currentPageData: T[]): void {
    // Remove any existing selections from current page
    const otherPageSelections = this.selectedRowsSubject.value.filter(
      (selectedRow) =>
        !currentPageData.some((pageRow) => pageRow.id === selectedRow.id)
    );

    // Add current page selections
    this.selectedRowsSubject.next([...otherPageSelections, ...currentPageData]);
    this.updateSelectionStates();
  }

  /**
   * Deselect all rows on current page
   */
  deselectAllCurrentPage(currentPageData: T[]): void {
    const currentSelection = this.selectedRowsSubject.value;
    this.selectedRowsSubject.next(
      currentSelection.filter(
        (selectedRow) =>
          !currentPageData.some((pageRow) => pageRow.id === selectedRow.id)
      )
    );
    this.updateSelectionStates();
  }

  /**
   * Toggle all rows on current page
   */
  toggleAllCurrentPage(currentPageData: T[]): void {
    const allCurrentPageSelected = currentPageData.every((pageRow) =>
      this.isRowSelected(pageRow)
    );

    if (allCurrentPageSelected) {
      this.deselectAllCurrentPage(currentPageData);
    } else {
      this.selectAllCurrentPage(currentPageData);
    }
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    this.selectedRowsSubject.next([]);
    this.isAllSelectedSubject.next(false);
    this.isSomeSelectedSubject.next(false);
  }

  /**
   * Get selection count
   */
  getSelectionCount(): number {
    return this.selectedRowsSubject.value.length;
  }

  /**
   * Check if any rows are selected
   */
  hasSelection(): boolean {
    return this.selectedRowsSubject.value.length > 0;
  }

  /**
   * Update selection states based on current selection
   */
  private updateSelectionStates(): void {
    const selectedCount = this.selectedRowsSubject.value.length;
    this.isAllSelectedSubject.next(selectedCount > 0);
    this.isSomeSelectedSubject.next(selectedCount > 0);
  }

  /**
   * Update selection states with total row count
   */
  updateSelectionStatesWithTotal(totalRows: number): void {
    const selectedCount = this.selectedRowsSubject.value.length;
    this.isAllSelectedSubject.next(
      selectedCount === totalRows && totalRows > 0
    );
    this.isSomeSelectedSubject.next(
      selectedCount > 0 && selectedCount < totalRows
    );
  }
}
