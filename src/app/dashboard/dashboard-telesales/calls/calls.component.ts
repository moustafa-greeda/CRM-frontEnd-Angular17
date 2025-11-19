import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { ICall } from '../../../core/Models/teleSalse/ICall';
import { CallsService } from './calls.service';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';
import { FormUiComponent } from '../../../shared/components/form-ui/form-ui.component';
import { DateUtilsService } from '../../../core/services/common/date-utils.service';
import { AuthService } from '../../../Auth/auth.service';

@Component({
  selector: 'app-calls',
  templateUrl: './calls.component.html',
  styleUrls: ['./calls.component.css'],
})
export class CallsComponent implements OnInit {
  pageTitle = 'المكالمات';
  breadcrumb = [
    { label: 'الرئيسية', link: '/dashboard/telesales' },
    { label: 'المكالمات', link: '/dashboard/telesales/calls' },
  ];
  calls: ICall[] = [];
  loading = false;
  dataSource = new MatTableDataSource<ICall>([]);

  displayedColumns: string[] = [
    'phoneNumber',
    'callDate',
    'callDuration',
    'callOutcome',
    'notes',
    'nextCall',
  ];

  columnLabels: { [key: string]: string } = {
    phoneNumber: 'رقم الهاتف',
    callDate: 'تاريخ المكالمة',
    callDuration: 'المدة (دقيقة)',
    callOutcome: 'نتيجة المكالمة',
    notes: 'ملاحظات',
    nextCall: 'موعد المتابعة',
  };

  callColumns = [
    { key: 'contactName', header: 'الاسم' },
    { key: 'callDate', header: 'تاريخ المكالمة', formatter: 'date' as const },
    { key: 'callDuration', header: 'المدة (دقيقة)' },
    { key: 'callOutcome', header: 'نتيجة المكالمة' },
    { key: 'notes', header: 'ملاحظات' },
    { key: 'nextCall', header: 'موعد المتابعة', formatter: 'date' as const },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageSize = 10;
  pageIndex = 0;
  totalCount = 0;
  currentPage = 1;
  totalCalls = 0;
  startOfMonth = '';
  endOfMonth = '';
  selectedCalls: ICall[] = [];

  // View mode: 'table' or 'card'
  viewMode: 'table' | 'card' = 'table';

  // Paginated calls for card view
  get paginatedCalls(): ICall[] {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.calls.slice(start, end);
  }

  constructor(
    private callsService: CallsService,
    private dialog: MatDialog,
    private notify: NotifyDialogService,
    private dateUtils: DateUtilsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCalls();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  // ==================================== load calls ===========================================
  async loadCalls(): Promise<void> {
    this.loading = true;

    // Get employee ID - try from cache first, then from API
    let employeeId = this.authService.getEmployeeId();

    // If not found in cache, fetch from API using employee name
    if (!employeeId) {
      employeeId = await this.authService.getEmployeeIdAsync();
    }

    if (!employeeId) {
      this.notify.error({
        title: 'خطأ',
        description: 'لم يتم العثور على معرف الموظف',
      });
      this.loading = false;
      return;
    }

    // =========== get all calls for tele sales employee ========================
    this.callsService.getAllCallsForTeleSales(employeeId).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.calls = response.data.calls || [];
          this.totalCalls = response.data.totalcalls || 0;
          this.startOfMonth = response.data.startOfMonth || '';
          this.endOfMonth = response.data.endOfMonth || '';
          this.dataSource.data = this.calls;
          this.totalCount = this.calls.length;
        } else {
          this.calls = [];
          this.dataSource.data = [];
          this.totalCount = 0;
        }
        this.loading = false;
      },
      error: () => {
        this.notify.error({
          title: 'خطأ',
          description: 'تعذر تحميل المكالمات في الوقت الحالي',
        });
        this.loading = false;
      },
    });
  }
  // ==================================== open create call dialog ===========================================

  openCreateCallDialog(): void {
    // Get current employee ID from auth service
    const employeeId = this.authService.getEmployeeId();

    // Set default call date to today
    const today = new Date().toISOString().split('T')[0];

    const dialogRef = this.dialog.open(FormUiComponent, {
      width: '700px',
      maxWidth: '95vw',
      panelClass: 'agreement-dialog',
      data: {
        config: {
          title: 'تسجيل مكالمة جديدة',
          submitText: 'حفظ',
          cancelText: 'إلغاء',
          fields: [
            {
              name: 'phoneNumber',
              label: 'رقم الهاتف',
              type: 'text',
              placeholder: 'أدخل رقم الهاتف (مثال: 01234567890)',
              required: true,
              colSpan: 2,
            },
            {
              name: 'callDate',
              label: 'تاريخ المكالمة',
              type: 'date',
              required: true,
              colSpan: 1,
            },
            {
              name: 'callDuration',
              label: 'مدة المكالمة (دقيقة)',
              type: 'number',
              placeholder: 'مثال: 5',
              required: false,
              colSpan: 1,
            },
            {
              name: 'callOutcome',
              label: 'نتيجة المكالمة',
              type: 'textarea',
              placeholder: 'أدخل نتيجة المكالمة...',
              required: true,
              colSpan: 3,
            },
            {
              name: 'notes',
              label: 'ملاحظات إضافية',
              type: 'textarea',
              placeholder: 'ملاحظات إضافية حول المكالمة (اختياري)...',
              required: false,
              colSpan: 3,
            },
            {
              name: 'nextCall',
              label: 'موعد المتابعة',
              type: 'date',
              placeholder: 'اختر تاريخ المتابعة',
              required: false,
              colSpan: 1,
            },
          ],
        },
        initialData: {
          callDate: today,
          employeeId: employeeId || undefined,
        },
      },
    });

    const componentInstance = dialogRef.componentInstance;
    let submitSubscription: Subscription | null = null;

    if (componentInstance?.formSubmit) {
      submitSubscription = componentInstance.formSubmit.subscribe(
        (formData: Record<string, unknown>) => {
          if (formData) {
            this.createCall(formData);
            dialogRef.close();
          }
        }
      );
    }

    dialogRef.afterClosed().subscribe(() => {
      submitSubscription?.unsubscribe();
    });
  }
  // ==================================== create call ===========================================

  private createCall(payload: Record<string, unknown>): void {
    const callPayload: ICall = {
      phoneNumber: (payload['phoneNumber'] as string) || undefined,
      callDate: (payload['callDate'] as string) || undefined,
      callDuration: Number(payload['callDuration']) || undefined,
      callOutcome: (payload['callOutcome'] as string) || undefined,
      notes: (payload['notes'] as string) || undefined,
      nextCall: (payload['nextCall'] as string) || undefined,
    };

    this.callsService.createCall(callPayload).subscribe({
      next: (response) => {
        if (response?.succeeded) {
          this.notify.success({
            title: 'تم الحفظ',
            description: 'تم تسجيل المكالمة بنجاح',
          });
          this.loadCalls();
        } else {
          this.notify.error({
            title: 'خطأ',
            description:
              response?.message || 'تعذر حفظ المكالمة، يرجى المحاولة لاحقاً',
          });
        }
      },
      error: (error) => {
        this.notify.error({
          title: 'خطأ',
          description:
            error?.error?.message || 'تعذر حفظ المكالمة، يرجى المحاولة لاحقاً',
        });
      },
    });
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return this.dateUtils.formatDate(date);
  }

  formatDateTime(date: string | undefined): string {
    if (!date) return '-';
    return this.dateUtils.formatDateTime(date);
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.currentPage = event.pageIndex + 1;
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'table' ? 'card' : 'table';
    this.pageIndex = 0; // Reset to first page when switching views
  }
}
