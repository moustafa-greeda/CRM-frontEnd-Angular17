import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { ITableColumn } from '../../core/Models/table/itable-column';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'], // fixed plural
})
export class TableComponent<T = any> {
  //   @Input() columns: ITableColumn<T>[] = [];
  //   @Input() data: T[] = [];
  //   @Input() total = 0;
  //   @Input() pageIndex = 0;
  //   @Input() pageSize = 10;
  //   @Input() pageSizeOptions: number[] = [5, 10, 20, 50, 100, 500];

  //   @Output() pageChange = new EventEmitter<{
  //     pageIndex: number;
  //     pageSize: number;
  //   }>();
  //   @Output() sortChange = new EventEmitter<Sort>();
  //   @Output() edit = new EventEmitter<T>();
  //   @Output() delete = new EventEmitter<T>();

  //   get displayedColumnKeys() {
  //     return this.columns.map((c) => c.key);
  //   }

  //   emitPage(ev: any) {
  //     this.pageChange.emit({ pageIndex: ev.pageIndex, pageSize: ev.pageSize });
  //   }

  //   emitSort(ev: Sort) {
  //     this.sortChange.emit(ev);
  //   }

  //   // helper to avoid parser errors in template
  //   value(row: any, key: string) {
  //     return row?.[key];
  //   }

  @Input() data: any[] = [];
  @Input() columns: ITableColumn<T>[] = [];
  @Input() total = 0;
  @Input() pageIndex = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions = [5, 10, 25, 50];

  @Output() sortChange = new EventEmitter<Sort>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();
  @Output() rowClick = new EventEmitter<any>();

  displayedColumnKeys: string[] = [];

  ngOnInit() {
    this.displayedColumnKeys = this.columns.map((col) => col.key);
  }

  emitSort(sort: Sort) {
    this.sortChange.emit(sort);
  }

  emitPage(event: PageEvent) {
    this.pageChange.emit(event);
  }

  getValue(object: any, path: string): any {
    return path.split('.').reduce((obj, key) => obj?.[key], object);
  }
}
