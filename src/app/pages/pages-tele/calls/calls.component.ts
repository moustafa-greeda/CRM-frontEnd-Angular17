import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { ICall } from '../../../core/Models/teleSalse/ICall';
import { CallsService } from './calls.service';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';
import { FormUiComponent } from '../../../shared/components/form-ui/form-ui.component';
import { DateUtilsService } from '../../../core/services/common/date-utils.service';
import { AuthService } from '../../../Auth/auth.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TableComponent } from '../../../shared/components/table/table.component';

@Component({
  selector: 'app-calls',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    PageHeaderComponent,
    TableComponent,
  ],
  templateUrl: './calls.component.html',
  styleUrls: ['./calls.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallsComponent implements OnInit {
  // ========== Services ==========
  private readonly callsService = inject(CallsService);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotifyDialogService);
  private readonly dateUtils = inject(DateUtilsService);
  private readonly authService = inject(AuthService);

  // ========== UI State ==========
  readonly pageTitle = 'المكالمات';
  readonly breadcrumb = [
    { label: 'الرئيسية', link: '/dashboard/telesales' },
    { label: 'المكالمات', link: '/dashboard/telesales/calls' },
  ];

  readonly callColumns = [
    { key: 'contactName', header: 'الاسم' },
    { key: 'callDate', header: 'تاريخ المكالمة', formatter: 'date' as const },
    { key: 'callDuration', header: 'المدة (دقيقة)' },
    { key: 'callOutcome', header: 'نتيجة المكالمة' },
    { key: 'notes', header: 'ملاحظات' },
    { key: 'nextCall', header: 'موعد المتابعة', formatter: 'date' as const },
  ];

  // ========== State Signals ==========
  readonly calls = signal<ICall[]>([]);
  readonly loading = signal<boolean>(false);
  readonly pageSize = signal<number>(10);
  readonly pageIndex = signal<number>(0);
  readonly totalCount = signal<number>(0);
  readonly currentPage = signal<number>(1);
  readonly totalCalls = signal<number>(0);
  readonly startOfMonth = signal<string>('');
  readonly endOfMonth = signal<string>('');
  readonly selectedCalls = signal<ICall[]>([]);
  readonly viewMode = signal<'table' | 'card'>('table');

  // ========== Computed Signals ==========
  readonly paginatedCalls = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return this.calls().slice(start, end);
  });

  readonly hasNoData = computed(() => this.calls().length === 0);

  ngOnInit(): void {
    this.loadCalls();
  }

  // ==================================== load calls ===========================================
  async loadCalls(): Promise<void> {
    this.loading.set(true);

    // Get employee ID - try from cache first, then from API
    const employeeId = this.authService.getEmployeeId();

    if (!employeeId) {
      this.notify.error({
        title: 'خطأ',
        description: 'لم يتم العثور على معرف الموظف',
      });
      this.loading.set(false);
      return;
    }

    // =========== get all calls for tele sales employee ========================
    this.callsService.getAllCallsForTeleSales(employeeId).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.calls.set(response.data.calls || []);
          this.totalCalls.set(response.data.totalcalls || 0);
          this.startOfMonth.set(response.data.startOfMonth || '');
          this.endOfMonth.set(response.data.endOfMonth || '');
          this.totalCount.set((response.data.calls || []).length);
        } else {
          this.calls.set([]);
          this.totalCount.set(0);
        }
        this.loading.set(false);
      },
      error: () => {
        this.notify.error({
          title: 'خطأ',
          description: 'تعذر تحميل المكالمات في الوقت الحالي',
        });
        this.loading.set(false);
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
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
    this.currentPage.set(event.pageIndex + 1);
  }

  toggleViewMode(): void {
    this.viewMode.update((mode) => (mode === 'table' ? 'card' : 'table'));
    this.pageIndex.set(0); // Reset to first page when switching views
  }
}
