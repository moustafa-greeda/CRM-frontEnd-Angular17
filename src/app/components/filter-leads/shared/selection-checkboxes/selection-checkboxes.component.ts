import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
} from '@angular/core';
import {
  TableSelectionService,
  SelectableData,
} from '../table-selection.service';

@Component({
  selector: 'app-selection-checkboxes',
  templateUrl: './selection-checkboxes.component.html',
  styleUrls: ['./selection-checkboxes.component.css'],
})
export class SelectionCheckboxesComponent<T extends SelectableData>
  implements OnInit, AfterViewInit, OnChanges
{
  @Input() showSelectAll: boolean = false;
  @Input() showRowCheckbox: boolean = false;
  @Input() rowData?: T;
  @Input() allData: T[] = [];
  @Input() currentPageData: T[] = [];
  @Input() selectedRows: T[] = [];

  @Output() selectAllChange = new EventEmitter<boolean>();
  @Output() rowSelectionChange = new EventEmitter<{
    row: T;
    selected: boolean;
  }>();

  @ViewChild('selectAllCheckbox')
  selectAllCheckbox?: ElementRef<HTMLInputElement>;

  isAllSelected: boolean = false;
  isSomeSelected: boolean = false;
  isRowSelected: boolean = false;

  constructor() {}

  ngAfterViewInit(): void {
    this.updateSelectionStates();
    this.updateSelectAllCheckboxState();
  }

  ngOnInit(): void {
    this.updateSelectionStates();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['selectedRows'] ||
      changes['allData'] ||
      changes['currentPageData']
    ) {
      this.updateSelectionStates();
    }
  }

  onSelectAllChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;

    this.selectAllChange.emit(isChecked);
    this.updateSelectAllCheckboxState();
  }

  onRowChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const isChecked = target.checked;

    if (this.rowData) {
      this.rowSelectionChange.emit({
        row: this.rowData,
        selected: isChecked,
      });
    }
  }

  private updateSelectionStates(): void {
    if (this.showSelectAll) {
      this.updateSelectAllStates();
    }

    if (this.showRowCheckbox && this.rowData) {
      this.updateRowSelectionState();
    }
  }

  private updateSelectAllStates(): void {
    const totalRows = this.allData.length;
    const selectedCount = this.selectedRows.length;

    this.isAllSelected = selectedCount === totalRows && totalRows > 0;
    this.isSomeSelected = selectedCount > 0 && selectedCount < totalRows;
  }

  private updateRowSelectionState(): void {
    if (this.rowData) {
      this.isRowSelected = this.selectedRows.some(
        (row) => row.id === this.rowData!.id
      );
    }
  }

  private updateSelectAllCheckboxState(): void {
    if (this.selectAllCheckbox) {
      this.selectAllCheckbox.nativeElement.indeterminate = this.isSomeSelected;
    }
  }
}
