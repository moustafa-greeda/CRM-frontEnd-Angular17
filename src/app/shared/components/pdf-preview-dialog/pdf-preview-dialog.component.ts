import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';

export interface PdfPreviewDialogData {
  pdfPath: string;
  title?: string;
}

@Component({
  selector: 'app-pdf-preview-dialog',
  templateUrl: './pdf-preview-dialog.component.html',
  styleUrls: ['./pdf-preview-dialog.component.css'],
})
export class PdfPreviewDialogComponent implements OnInit {
  pdfSrc: string = '';
  safePdfUrl: SafeResourceUrl = '';
  isBrowser: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<PdfPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PdfPreviewDialogData,
    @Inject(PLATFORM_ID) private platformId: Object,
    private sanitizer: DomSanitizer
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (this.data?.pdfPath) {
      this.pdfSrc = this.convertPathToUrl(this.data.pdfPath);
      // Sanitize URL for iframe
      if (this.isBrowser) {
        this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.pdfSrc
        );
      }
    }
  }

  /**
   * Convert server file path to accessible URL
   * Handles Windows paths and converts them to API URLs
   */
  private convertPathToUrl(path: string): string {
    // If it's already a URL (starts with http:// or https://), use it directly
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // If it's a Windows path (contains backslashes), extract filename and construct URL
    if (path.includes('\\')) {
      // Extract filename from Windows path
      // Example: C:\inetpub\wwwroot\CRM Deploy\wwwroot\invoices\Invoice_47.pdf
      const fileName = path.split('\\').pop() || '';

      // Construct URL - adjust this based on your backend API structure
      // Option 1: If your API serves files from a specific endpoint
      const baseUrl = environment.apiUrl.replace('/api', ''); // Remove /api to get base URL
      return `${baseUrl}/invoices/${fileName}`;

      // Option 2: If files are served from root
      // return `/invoices/${fileName}`;
    }

    // If it's a relative path (starts with /), use it as is
    if (path.startsWith('/')) {
      return path;
    }

    // Default: return as is (might be a relative path without leading slash)
    return path;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onDownload(): void {
    if (this.isBrowser && this.pdfSrc) {
      const link = document.createElement('a');
      link.href = this.pdfSrc;
      link.download = this.data.pdfPath?.split('\\').pop() || 'invoice.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
