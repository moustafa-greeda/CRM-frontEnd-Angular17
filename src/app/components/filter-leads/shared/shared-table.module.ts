import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Services
import { TableExportService } from './table-export.service';
import { TableSelectionService } from './table-selection.service';

// Components
import { ExportButtonsComponent } from './export-buttons/export-buttons.component';
import { SelectionCheckboxesComponent } from './selection-checkboxes/selection-checkboxes.component';

@NgModule({
  declarations: [ExportButtonsComponent, SelectionCheckboxesComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [ExportButtonsComponent, SelectionCheckboxesComponent],
  providers: [TableExportService, TableSelectionService],
})
export class SharedTableModule {}
