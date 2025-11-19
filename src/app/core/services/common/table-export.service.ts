import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';
import { NgxSpinnerService } from 'ngx-spinner';

export interface ExportableData {
  id?: string | number;
  [key: string]: any;
}

export interface ExportOptions {
  fileName: string;
  showSpinner?: boolean;
  spinnerMessage?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TableExportService {
  constructor(
    private notifyDialog: NotifyDialogService,
    private spinner: NgxSpinnerService
  ) {}

  /**
   * Export selected rows to Excel
   */
  exportSelectedRows<T extends ExportableData>(
    selectedRows: T[],
    options: ExportOptions
  ): void {
    if (selectedRows.length === 0) {
      this.notifyDialog.error({
        title: 'خطأ في التصدير',
        description: 'يرجى تحديد الصفوف المراد تصديرها',
        autoCloseMs: 3000,
      });
      return;
    }

    if (options.showSpinner) {
      this.spinner.show();
    }

    this.exportToExcel(selectedRows, options.fileName);
  }

  /**
   * Export current page data to Excel
   */
  exportCurrentPage<T extends ExportableData>(
    currentPageData: T[],
    options: ExportOptions
  ): void {
    if (currentPageData.length === 0) {
      this.notifyDialog.error({
        title: 'خطأ في التصدير',
        description: 'لا توجد بيانات في الصفحة الحالية للتصدير',
        autoCloseMs: 3000,
      });
      return;
    }

    if (options.showSpinner) {
      this.spinner.show();
    }

    this.exportToExcel(currentPageData, options.fileName);
  }

  /**
   * Export all data to Excel
   */
  exportAllData<T extends ExportableData>(
    allData: T[],
    options: ExportOptions
  ): void {
    if (allData.length === 0) {
      this.notifyDialog.error({
        title: 'خطأ في التصدير',
        description: 'لا توجد بيانات للتصدير',
        autoCloseMs: 3000,
      });
      return;
    }

    if (options.showSpinner) {
      this.spinner.show();
    }

    this.exportToExcel(allData, options.fileName);
  }

  /**
   * Main export method - converts data to Excel and downloads
   */
  private exportToExcel<T extends ExportableData>(
    data: T[],
    fileName: string
  ): void {
    try {
      // Prepare data for Excel with Arabic headers
      const excelData = this.prepareDataForExcel(data);

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = this.calculateColumnWidths(excelData);
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'البيانات');

      // Generate filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, '-');
      const fullFileName = `${fileName}_${timestamp}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fullFileName);

      // Hide spinner and show success dialog
      this.spinner.hide();
      this.notifyDialog.success({
        title: 'تم التصدير بنجاح',
        description: `تم تصدير ${data.length} سجل بنجاح إلى ملف ${fullFileName}`,
        autoCloseMs: 4000,
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      // Hide spinner and show error dialog
      this.spinner.hide();
      this.notifyDialog.error({
        title: 'خطأ في التصدير',
        description: 'حدث خطأ أثناء تصدير الملف: ' + errorMessage,
        autoCloseMs: 5000,
      });
    }
  }

  /**
   * Prepare data for Excel export with Arabic headers
   */
  private prepareDataForExcel<T extends ExportableData>(data: T[]): any[] {
    if (data.length === 0) return [];

    // Get the first item to determine headers
    const firstItem = data[0];
    const headers = Object.keys(firstItem);

    // Arabic header mapping
    const arabicHeaders: { [key: string]: string } = {
      // Personal Data Headers
      id: 'المعرف',
      name: 'الاسم',
      jobTitle: 'المسمى الوظيفي',
      prefaredLanguage: 'اللغة المفضلة',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      personality: 'الشخصية',
      customerLevel: 'مستوى العميل',
      customerType: 'نوع العميل',
      language: 'اللغة',
      department: 'القسم',
      city: 'المدينة',
      country: 'الدولة',
      age: 'العمر',
      jobLevel: 'المستوى الوظيفي',
      industry: 'الصناعة',
      industryName: 'اسم الصناعة',
      comapnySize: 'حجم الشركة',
      entryChanel: 'قناة الدخول',

      // Company Data Headers
      companyName: 'اسم الشركة',
      digitalTransactions: 'التعاملات الرقمية',
      branches: 'عدد الفروع',
      ownership: 'نوع الملكية',
      location: 'الموقع',
      companyStage: 'مرحلة الشركة',
      size: 'الحجم',
    };

    // Convert data to Excel format
    return data.map((item) => {
      const excelItem: any = {};
      headers.forEach((header) => {
        const arabicHeader = arabicHeaders[header] || header;
        excelItem[arabicHeader] = item[header];
      });
      return excelItem;
    });
  }

  /**
   * Calculate optimal column widths for Excel
   */
  private calculateColumnWidths(data: any[]): any[] {
    if (data.length === 0) return [];

    const firstItem = data[0];
    const headers = Object.keys(firstItem);

    return headers.map((header) => {
      // Calculate max width based on content
      const maxContentLength = Math.max(
        header.length,
        ...data.map((item) => String(item[header] || '').length)
      );

      // Set reasonable width limits
      const minWidth = 10;
      const maxWidth = 50;
      const calculatedWidth = Math.max(
        minWidth,
        Math.min(maxWidth, maxContentLength + 2)
      );

      return { wch: calculatedWidth };
    });
  }

  /**
   * Show spinner with custom message
   */
  showSpinner(message: string = 'جاري التحميل...'): void {
    this.spinner.show('export-spinner', {
      bdColor: 'rgba(0,0,0,0.8)',
      size: 'medium',
      color: '#fff',
      type: 'ball-scale-multiple',
      fullScreen: true,
      template: `
        <div style="text-align: center;">
          <div class="spinner-border text-light" role="status"></div>
          <p style="color: white; font-size: 18px; margin-top: 20px; font-family: 'Cairo', sans-serif;">
            ${message}
          </p>
        </div>
      `,
    });
  }

  /**
   * Hide spinner
   */
  hideSpinner(): void {
    this.spinner.hide('export-spinner');
  }
}
