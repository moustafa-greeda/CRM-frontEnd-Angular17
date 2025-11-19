import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  TableExportService,
  ExportableData,
} from '../../../core/services/common/table-export.service';

export interface ExportButtonConfig {
  showSelectedExport?: boolean;
  showCurrentPageExport?: boolean;
  showAllDataExport?: boolean;
  selectedFileName?: string;
  currentPageFileName?: string;
  allDataFileName?: string;
  showSpinner?: boolean;
  spinnerMessage?: string;
}

@Component({
  selector: 'app-export-buttons',
  template: `
    <div class="export-buttons-container">
      <div class="export-buttons">
        <button
          *ngIf="config.showSelectedExport"
          class="export-btn selected-export"
          (click)="onExportSelected()"
          [disabled]="!hasSelectedRows"
        >
          <i class="material-icons">check_circle</i>
          تصدير المحدد
        </button>

        <button
          *ngIf="config.showCurrentPageExport"
          class="export-btn current-page-export"
          (click)="onExportCurrentPage()"
          [disabled]="!hasCurrentPageData"
        >
          <i class="material-icons">description</i>
          تصدير الصفحة الحالية
        </button>

        <button
          *ngIf="config.showAllDataExport"
          class="export-btn all-data-export"
          (click)="onExportAllData()"
          [disabled]="!hasAllData"
        >
          <i class="material-icons">cloud_download</i>
          تصدير الكل
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .export-buttons-container {
        margin: 20px 0;
        display: flex;
        justify-content: center;
      }

      .export-buttons {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
        justify-content: center;
      }

      .export-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: 'Cairo', sans-serif;
        min-width: 150px;
        justify-content: center;
      }

      .export-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
      }

      .export-btn:not(:disabled):hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .export-btn i {
        font-size: 25px;
      }

      /* selected export */
      .selected-export {
        background-color: #ff5f00 !important;
        color: #fff;
      }

      .export-btn:disabled.selected-export {
        background-color: #ff5f00 !important;
        color: #fff !important;
        opacity: 0.5;
      }

      /* Current page button */
      .current-page-export {
        background-color: #005766;
        color: #fff;
      }

      /* All data button */
      .all-data-export {
        background-color: #993800;
        color: #fff;
      }

      @media (max-width: 768px) {
        .export-buttons {
          flex-direction: column;
          width: 100%;
        }

        .export-btn {
          width: 100%;
          min-width: auto;
        }
      }
    `,
  ],
})
export class ExportButtonsComponent {
  @Input() selectedRows: ExportableData[] = [];
  @Input() currentPageData: ExportableData[] = [];
  @Input() allData: ExportableData[] = [];
  @Input() config: ExportButtonConfig = {
    showSelectedExport: true,
    showCurrentPageExport: true,
    showAllDataExport: true,
    selectedFileName: 'البيانات المحددة',
    currentPageFileName: 'صفحة البيانات الحالية',
    allDataFileName: 'جميع البيانات',
    showSpinner: true,
    spinnerMessage: 'جاري التصدير...',
  };

  @Output() exportSelected = new EventEmitter<ExportableData[]>();
  @Output() exportCurrentPage = new EventEmitter<ExportableData[]>();
  @Output() exportAllData = new EventEmitter<ExportableData[]>();

  constructor(private exportService: TableExportService) {}

  get hasSelectedRows(): boolean {
    return this.selectedRows.length > 0;
  }

  get hasCurrentPageData(): boolean {
    return this.currentPageData.length > 0;
  }

  get hasAllData(): boolean {
    return true; // Always enable "export all" since it fetches from API
  }

  onExportSelected(): void {
    if (this.hasSelectedRows) {
      this.exportService.exportSelectedRows(this.selectedRows, {
        fileName: this.config.selectedFileName || 'البيانات المحددة',
        showSpinner: this.config.showSpinner,
        spinnerMessage: this.config.spinnerMessage,
      });
      this.exportSelected.emit(this.selectedRows);
    }
  }

  onExportCurrentPage(): void {
    if (this.hasCurrentPageData) {
      this.exportService.exportCurrentPage(this.currentPageData, {
        fileName: this.config.currentPageFileName || 'صفحة البيانات الحالية',
        showSpinner: this.config.showSpinner,
        spinnerMessage: this.config.spinnerMessage,
      });
      this.exportCurrentPage.emit(this.currentPageData);
    }
  }

  onExportAllData(): void {
    // Emit event to parent component to handle API-based export
    this.exportAllData.emit([]);
  }
}
