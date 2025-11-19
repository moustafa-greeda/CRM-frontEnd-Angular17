import { Component, OnInit } from '@angular/core';
import {
  ExportDataService,
  IDropDownImportedData,
} from './export-data.service';
import { NotifyDialogService } from '../../shared/components/notify-dialog-host/notify-dialog.service';
import { IPostLead } from '../../core/Models/leads/ipost-lead';
import { ApiResponse } from '../leads/distribution/distribution.service';
import { MatDialog } from '@angular/material/dialog';
import {
  DetailViewDialogComponent,
  DetailViewDialogData,
} from '../../shared/components/detail-view-dialog/detail-view-dialog.component';

/*---------------------------- Interfaces --------------*/
interface BreadcrumbItem {
  label: string;
  link: string | null;
}

@Component({
  selector: 'app-exported-data',
  templateUrl: './exported-data.component.html',
  styleUrl: './exported-data.component.css',
})
export class ExportedDataComponent implements OnInit {
  /*---------------------------- Properties --------------*/
  breadcrumb: BreadcrumbItem[] = [
    { label: 'الرئيسية', link: '/dashboard/sales' },
    { label: ' استقبال البيانات المصدرة', link: null },
  ];

  dropdownOptions: string[] = [];
  selectedJobId: string = '';
  archivedData: IPostLead[] = [];
  isLoading = false;
  pageSize = 10;
  currentPage = 1;
  totalCount = 0;

  companyColumns = [
    { key: 'name', header: 'الاسم' },
    { key: 'companyName', header: 'اسم الشركة' },
    { key: 'jobTitle', header: 'المسمى الوظيفي' },
    { key: 'email', header: 'البريد الإلكتروني' },
    { key: 'phone', header: 'رقم الهاتف' },
    { key: 'age', header: 'العمر' },
    { key: 'actions', header: 'الإجراءات' },
    // { key: 'webSiteUrl', header: 'رابط الموقع' },
    // { key: 'notes', header: 'ملاحظات' },
  ];

  /*---------------------------- Constructor --------------*/
  constructor(
    private exportDataService: ExportDataService,
    private notify: NotifyDialogService,
    private dialog: MatDialog
  ) {}

  /*---------------------------- Lifecycle Hooks --------------*/
  ngOnInit(): void {
    this.loadDropdownOptions();
  }

  /*---------------------------- Dropdown Methods --------------*/
  loadDropdownOptions(jobId: string = ''): void {
    this.isLoading = true;

    this.exportDataService.getDropDownImportedDatabyJobId(jobId).subscribe({
      next: (response: ApiResponse<IDropDownImportedData[]>) => {
        this.isLoading = false;
        if (response && response.succeeded && response.data) {
          this.dropdownOptions = response.data.map((item) => item.importJobId);
        } else {
          this.dropdownOptions = [];
          if (jobId) {
            this.notify.open({
              type: 'error',
              title: 'فشل التحميل',
              description: response?.message || 'لم يتم العثور على بيانات',
            });
          }
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading dropdown data:', error);
        this.dropdownOptions = [];
        if (jobId) {
          this.notify.open({
            type: 'error',
            title: 'فشل التحميل',
            description:
              error?.error?.message || 'حدث خطأ أثناء تحميل البيانات',
          });
        }
      },
    });
  }

  onJobIdSelected(selectedJobId: string): void {
    if (!selectedJobId) {
      return;
    }

    this.selectedJobId = selectedJobId;
    this.loadArchivedData(selectedJobId);
  }

  /*---------------------------- API Methods --------------*/
  loadArchivedData(jobId: string): void {
    this.isLoading = true;
    this.currentPage = 1;

    this.exportDataService.GetArchivedData(jobId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response && response.succeeded && response.data) {
          this.archivedData = response.data.items || [];
          this.totalCount = response.data.totalCount || 0;
        } else {
          this.archivedData = [];
          this.totalCount = 0;
          this.notify.open({
            type: 'error',
            title: 'فشل التحميل',
            description: response?.message || 'لم يتم العثور على بيانات مؤرشفة',
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading archived data:', error);
        this.archivedData = [];
        this.totalCount = 0;
        this.notify.open({
          type: 'error',
          title: 'فشل التحميل',
          description: 'حدث خطأ أثناء تحميل البيانات المؤرشفة',
        });
      },
    });
  }

  /*---------------------------- Table Methods --------------*/
  onPageChange(event: any): void {
    if (this.totalCount === 0) {
      return;
    }

    const newPage = event.pageIndex + 1;
    this.currentPage = newPage;
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    this.currentPage = 1;
  }

  onRowSelectionChange(event: { row: any; selected: boolean }): void {
    // Handle row selection if needed
  }

  onSelectAllChange(selectAll: boolean): void {
    // Handle select all if needed
  }

  /*---------------------------- View Dialog Methods --------------*/
  onViewDeal(row: IPostLead): void {
    const dialogData: DetailViewDialogData = {
      title: 'تفاصيل البيانات المصدرة',
      data: row as Record<string, any>,
      fields: [
        { key: 'name', label: 'الاسم', type: 'text' },
        { key: 'companyName', label: 'اسم الشركة', type: 'text' },
        { key: 'jobTitle', label: 'المسمى الوظيفي', type: 'text' },
        { key: 'email', label: 'البريد الإلكتروني', type: 'email' },
        { key: 'phone', label: 'رقم الهاتف', type: 'phone' },
        { key: 'age', label: 'العمر', type: 'text' },
        { key: 'webSiteUrl', label: 'رابط الموقع', type: 'url' },
        {
          key: 'isHaveSocialMedia',
          label: 'هل يملك حسابات على الشبكات الاجتماعية',
          type: 'boolean',
        },
        {
          key: 'socialMediaLink',
          label: 'رابط الحساب الاجتماعي',
          type: 'json',
        },
        { key: 'notes', label: 'ملاحظات', type: 'text' },
      ],
    };

    this.dialog.open(DetailViewDialogComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: dialogData,
      panelClass: 'agreement-dialog',
    });
  }
}
