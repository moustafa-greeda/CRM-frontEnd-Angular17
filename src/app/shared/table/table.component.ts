import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { ITableColumn } from '../../core/Models/table/itable-column';
import { PageEvent } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'], // fixed plural
})
export class TableComponent<T = any> {
  @Input() data: any[] = [];
  @Input() columns: ITableColumn<T>[] = [];
  @Input() total = 0;
  @Input() pageIndex = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions = [5, 10, 25, 50];
  @Input() showEdit: boolean = true;

  @Output() sortChange = new EventEmitter<Sort>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() rowClick = new EventEmitter<T>();
  // @Output() search = new EventEmitter<string>();

  // displayedColumnKeys: string[] = [];
  // readonly searchCtrl = new FormControl<string>('', { nonNullable: true });

  @Output() search = new EventEmitter<string>(); // 👈 هنا الحدث

  displayedColumnKeys: string[] = [];

  readonly searchCtrl = new FormControl<string>('', { nonNullable: true });
  private sub?: Subscription;
  // ngOnInit() {
  //   this.displayedColumnKeys = this.columns.map((col) => col.key);
  // }

  ngOnInit(): void {
    this.displayedColumnKeys = this.columns.map((c) => c.key);

    // 🔎 اشترك في تغيّر قيمة البحث وأرسلها للأب (مع debounce)
    this.sub = this.searchCtrl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged())
      .subscribe((term) => this.search.emit(term.trim()));
  }

  emitSort(sort: Sort) {
    this.sortChange.emit(sort);
  }

  onRowClick(row: T) {
    // ✅ دالة وسيطة للـ template
    this.rowClick.emit(row);
  }

  emitPage(event: PageEvent) {
    this.pageChange.emit(event);
  }

  getValue(object: any, path: string): any {
    return path.split('.').reduce((obj, key) => obj?.[key], object);
  }
}
