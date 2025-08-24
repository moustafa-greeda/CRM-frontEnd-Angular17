import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';

import { ITableColumn } from '../../core/Models/table/itable-column';
import { FormDialogComponent } from '../../shared/form/form-dialog/form-dialog.component';
import { ConfirmDeleteComponent } from '../../shared/form/confirm-delete/confirm-delete.component';
import { NotifyDialogService } from '../../shared/notify-dialog/notify-dialog.service';
import { IEmployee } from '../../core/Models/employee/iemployee';
import { EmployeeService } from './employee.service';
import { EmployeeFormComponent } from './employee-form/employee-form.component';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css',
})
export class EmployeeComponent {
  // Observable streams for the department list and total count
  // departments$ = this.departmentsService.departments$;
  // totalCount$ = this.departmentsService.totalCount$;

  // Pagination state
  pageIndex = 0;
  pageSize = 10;

  // Sorting state
  sortField = '';
  sortDir: 'asc' | 'desc' | '' = '';

  searchKeyword = '';

  // Table column definitions
  columns: ITableColumn<IEmployee>[] = [
    { key: 'name', header: 'اسم الموظف', sortable: true },
    { key: 'description', header: 'الوصف', sortable: false },
    { key: 'actions', header: 'العمليات' },
  ];

  constructor(
    private _employeeService: EmployeeService,
    private dialog: MatDialog,
    private notify: NotifyDialogService
  ) {}

  // ngOnInit(): void {
  //   this.fetch();
  // }

  /**
   * Fetches department data from the service
   * with current pagination and sorting state.
   */
  // private fetch() {
  //   this._employeeService.refreshDepartments({
  //     pageIndex: this.pageIndex + 1, // backend expects 1-based page index
  //     pageSize: this.pageSize,
  //     SortField: this.sortField || undefined,
  //     SortDirection: this.sortDir || undefined,
  //     SearchKeyword: this.searchKeyword || undefined,
  //   });
  // }

  /**
   * Handles table pagination events.
   */
  // onPageChange(ev: { pageIndex: number; pageSize: number }) {
  //   this.pageIndex = ev.pageIndex;
  //   this.pageSize = ev.pageSize;
  //   this.fetch();
  // }

  /**
   * Handles table sorting events.
   */
  // onSortChange(ev: Sort) {
  //   this.sortField = ev.active || '';
  //   this.sortDir = (ev.direction as 'asc' | 'desc') || '';
  //   this.pageIndex = 0; // reset to first page on sort change
  //   this.fetch();
  // }

  // <app-table (search)="onSearch($event)">
  // onSearch(term: string) {
  //   this.searchKeyword = term;
  //   this.pageIndex = 0;
  //   this.fetch();
  // }

  /**
   * Opens the Add/Edit department form dialog.
   * param dept - Department data if editing, undefined if adding.
   */

  openDialog(emp?: IEmployee): void {
    const isEdit = !!emp;
    const dialogRef = this.dialog.open(EmployeeFormComponent, {
      width: '900px',
      panelClass: 'form-dialog--employee',
      data: {
        title: isEdit ? 'تعديل موظف' : 'اضافة موظف',
        // fields: [
        //   { name: 'name', label: 'الاسم', type: 'text', required: true },
        //   { name: 'email', label: 'البريد', type: 'email', required: true },
        //   { name: 'phoneNumber', label: 'الجوال', type: 'text' },
        //   { name: 'dateOfBirth', label: 'تاريخ الميلاد', type: 'date' },
        //   {
        //     name: 'hireDate',
        //     label: 'تاريخ التعيين',
        //     type: 'date',
        //     required: true,
        //   },
        //   {
        //     name: 'departmentId',
        //     label: 'القسم',
        //     type: 'number',
        //     required: true,
        //   },
        //   { name: 'titleId', label: 'الوظيفة', type: 'number', required: true },
        //   { name: 'position', label: 'المسمى', type: 'text' },
        //   { name: 'salary', label: 'الراتب', type: 'number' },
        //   { name: 'isActive', label: 'نشط؟', type: 'checkbox' },
        //   { name: 'address', label: 'العنوان', type: 'textarea' },
        //   { name: 'gender', label: 'النوع', type: 'text' },
        // ],
        initialData: emp || {},
      },
    });

    // Handle dialog result (save changes)
    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const req$ =
        isEdit && emp?.id
          ? this._employeeService.update(emp.id, result)
          : this._employeeService.add(result);

      req$.subscribe(() => {
        //Show success dialog with dynamic title
        this.notify.success({
          title: isEdit ? 'تعديل ناجح' : 'نجاح',
          description: isEdit ? 'تم تعديل القسم بنجاح' : 'تم اضافة القسم بنجاح',
        });
        // this.fetch();
      });
    });
  }

  /**
   * Triggered when clicking the Edit action.
   */
  // onEditDepartment(dept: IEmployee) {
  //   this.openDialog(dept);
  // }

  /**
   * Opens confirmation dialog for deleting a department.
   */
  // onDeleteDepartment(dept?: IEmployee): void {
  //   if (!dept?.id) {
  //     this.toastr.error('Invalid department ID');
  //     return;
  //   }

  //   const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
  //     width: '420px',
  //     data: { title: 'Department', message: 'department' },
  //   });

  //   // Handle delete confirmation
  //   dialogRef.afterClosed().subscribe((ok) => {
  //     if (!ok) return;
  //     this._employeeService.delete(dept.id!).subscribe(() => {
  //       this.toastr.error('Department deleted');
  //       this.fetch();
  //     });
  //   });
  // }
}
