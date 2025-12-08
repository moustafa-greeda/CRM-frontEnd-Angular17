import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { PdfPreviewDialogComponent } from './pdf-preview-dialog.component';

// Note: PdfViewerModule is imported dynamically in the component to avoid SSR issues
// We don't import it here to prevent SSR errors

@NgModule({
  declarations: [PdfPreviewDialogComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    // PdfViewerModule is NOT imported here to avoid SSR issues
    // It will be loaded dynamically in browser only
  ],
  exports: [PdfPreviewDialogComponent],
})
export class PdfPreviewDialogModule {}
