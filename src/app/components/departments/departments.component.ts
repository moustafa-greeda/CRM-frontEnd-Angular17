import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Sort } from '@angular/material/sort';
import { DepartmentsService } from './departments.service';
import { IDepartments } from '../../core/Models/departments/idepartments.model';
import { ITableColumn } from '../../core/Models/table/itable-column';
import { FormDialogComponent } from '../../shared/form/form-dialog/form-dialog.component';
import { ConfirmDeleteComponent } from '../../shared/form/confirm-delete/confirm-delete.component';
import { NotifyDialogService } from '../../shared/notify-dialog/notify-dialog.service';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.css',
})
export class DepartmentsComponent {
  // Observable streams for the department list and total count
  departments$ = this.departmentsService.departments$;
  totalCount$ = this.departmentsService.totalCount$;

  // Pagination state
  pageIndex = 0;
  pageSize = 10;

  // Sorting state
  sortField = '';
  sortDir: 'asc' | 'desc' | '' = '';

  searchKeyword = '';

  // Table column definitions
  columns: ITableColumn<IDepartments>[] = [
    { key: 'name', header: 'القسم', sortable: true },
    { key: 'description', header: 'الوصف', sortable: false },
    { key: 'actions', header: 'العمليات' },
  ];

  constructor(
    private departmentsService: DepartmentsService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private notify: NotifyDialogService
  ) {}

  ngOnInit(): void {
    this.fetch();
  }

  /**
   * Fetches department data from the service
   * with current pagination and sorting state.
   */
  private fetch() {
    this.departmentsService.refreshDepartments({
      pageIndex: this.pageIndex + 1, // backend expects 1-based page index
      pageSize: this.pageSize,
      SortField: this.sortField || undefined,
      SortDirection: this.sortDir || undefined,
      SearchKeyword: this.searchKeyword || undefined,
    });
  }

  /**
   * Handles table pagination events.
   */
  onPageChange(ev: { pageIndex: number; pageSize: number }) {
    this.pageIndex = ev.pageIndex;
    this.pageSize = ev.pageSize;
    this.fetch();
  }

  /**
   * Handles table sorting events.
   */
  onSortChange(ev: Sort) {
    this.sortField = ev.active || '';
    this.sortDir = (ev.direction as 'asc' | 'desc') || '';
    this.pageIndex = 0; // reset to first page on sort change
    this.fetch();
  }

  // <app-table (search)="onSearch($event)">
  onSearch(term: string) {
    this.searchKeyword = term;
    this.pageIndex = 0;
    this.fetch();
  }

  /**
   * Opens the Add/Edit department form dialog.
   * param dept - Department data if editing, undefined if adding.
   */
  openDialog(dept?: IDepartments): void {
    const isEdit = !!dept;
    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: '700px',
      data: {
        title: isEdit ? 'Edit Department' : 'Add Department',
        fields: [
          { name: 'name', label: 'القسم', type: 'text', required: true },
          {
            name: 'description',
            label: 'الوصف',
            type: 'textarea',
            required: true,
          },
        ],
        initialData: dept || {},
      },
    });

    // Handle dialog result (save changes)
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const req$ =
        isEdit && dept?.id
          ? this.departmentsService.update(dept.id, result)
          : this.departmentsService.add(result);

      req$.subscribe(() => {
        //Show success dialog with dynamic title
        this.notify.success({
          title: isEdit ? 'تعديل ناجح' : 'نجاح',
          description: isEdit ? 'تم تعديل القسم بنجاح' : 'تم اضافة القسم بنجاح',
        });
        this.fetch();
      });
    });
  }

  /**
   * Triggered when clicking the Edit action.
   */
  onEditDepartment(dept: IDepartments) {
    this.openDialog(dept);
  }

  /**
   * Opens confirmation dialog for deleting a department.
   */
  onDeleteDepartment(dept?: IDepartments): void {
    if (!dept?.id) {
      this.toastr.error('Invalid department ID');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
      width: '420px',
      data: { title: 'Department', message: 'department' },
    });

    // Handle delete confirmation
    dialogRef.afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.departmentsService.delete(dept.id!).subscribe(() => {
        // this.toastr.error('Department deleted');
        this.notify.error({
          title: 'نجاح',
        });
        this.fetch();
      });
    });
  }
}
