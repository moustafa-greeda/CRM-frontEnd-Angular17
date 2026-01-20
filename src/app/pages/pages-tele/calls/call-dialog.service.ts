import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { FormUiComponent } from '../../../shared/components/form-ui/form-ui.component';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';
import { CallsService } from './calls.service';
import { CallStatusService } from '../../../core/services/common/call-status.service';
import { AuthService } from '../../../Auth/auth.service';
import { ICall } from '../../../core/Models/teleSalse/ICall';
import { ICallStatus } from '../../../core/Models/common/call-status';
import { formUiConfig } from '../../../shared/interfaces/formUi.interface';

export interface CallDialogOptions {
  call?: ICall;
  lead?: any;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

@Injectable({
  providedIn: 'root',
})
export class CallDialogService {
  private callStatusList: ICallStatus[] = [];

  constructor(
    private dialog: MatDialog,
    private notify: NotifyDialogService,
    private callsService: CallsService,
    private callStatusService: CallStatusService,
    private authService: AuthService
  ) {}

  /**
   * Open create call dialog
   */
  openCreateCallDialog(options: CallDialogOptions = {}): void {
    const { call, lead, onSuccess, onError } = options;

    // Load call status list if not already loaded
    this.loadCallStatusList().subscribe({
      next: (statusList) => {
        this.callStatusList = statusList;
        this._openDialog(call, lead, onSuccess, onError);
      },
      error: () => {
        this.callStatusList = [];
        this._openDialog(call, lead, onSuccess, onError);
      },
    });
  }

  /**
   * Load call status list
   */
  private loadCallStatusList(): Observable<ICallStatus[]> {
    if (this.callStatusList.length > 0) {
      return of(this.callStatusList);
    }

    return this.callStatusService.getAllCallStatus().pipe(
      switchMap((response) => {
        if (response.succeeded && response.data) {
          this.callStatusList = response.data.map(
            (item: any): ICallStatus => ({
              id: item.id,
              status: item.status,
            })
          );
        }
        return of(this.callStatusList);
      })
    );
  }

  /**
   * Internal method to open the dialog
   */
  private _openDialog(
    call?: ICall,
    lead?: any,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ): void {
    // Get current employee ID from auth service
    const employeeId = this.authService.getEmployeeId();

    // Set default call date to today
    const today = new Date().toISOString().split('T')[0];

    // Get phone number from lead if available
    const initialPhoneNumber = call?.phoneNumber || '';

    // Prepare call status options
    const callStatusOptions = this.callStatusList.map((status) => ({
      value: status.id ?? undefined,
      label: status.status || '',
    }));

    // Create form configuration
    const formConfig: formUiConfig = {
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
          name: 'callStatusId',
          label: 'حالة المكالمة',
          type: 'select',
          placeholder: 'اختر حالة المكالمة',
          required: true,
          colSpan: 1,
          options: callStatusOptions,
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
          name: 'nextCall',
          label: 'موعد المتابعة',
          type: 'date',
          placeholder: 'اختر تاريخ المتابعة',
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
      ],
    };

    // Open dialog
    const dialogRef = this.dialog.open(FormUiComponent, {
      width: '700px',
      maxWidth: '95vw',
      panelClass: 'agreement-dialog',
      data: {
        config: formConfig,
        initialData: {
          leadId: lead?.leadId || undefined,
          phoneNumber: initialPhoneNumber || lead?.phoneNumber || '',
          callDate: today,
          employeeId: employeeId || undefined,
        },
      },
    });

    // Listen to formSubmit event
    dialogRef.componentInstance.formSubmit.subscribe((formData) => {
      if (formData) {
        // Ensure leadId is included from lead if not in formData
        if (!formData['leadId'] && lead) {
          formData['leadId'] = lead?.leadId;
        }
        this.createCall(formData, onSuccess, onError);
        dialogRef.close();
      }
    });

    // Also listen for dialog close
    dialogRef.afterClosed().subscribe(() => {
      // Unsubscribe to prevent memory leaks
      if (dialogRef.componentInstance?.formSubmit) {
        dialogRef.componentInstance.formSubmit.unsubscribe();
      }
    });
  }

  /**
   * Create call using CreateTeleSalesCall API
   */
  createCall(
    payload: Record<string, unknown>,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ): void {
    // Format dates to ISO string if needed
    const formatDateForAPI = (date: string | undefined): string | undefined => {
      if (!date) return undefined;
      // If date is already in ISO format, return as is
      if (date.includes('T')) return date;
      // Otherwise, convert to ISO format
      const dateObj = new Date(date);
      return isNaN(dateObj.getTime()) ? undefined : dateObj.toISOString();
    };

    const callPayload: ICall = {
      leadId: payload['leadId'] ? Number(payload['leadId']) : undefined,
      employeeId: payload['employeeId']
        ? Number(payload['employeeId'])
        : this.authService.getEmployeeId() || undefined,
      phoneNumber: (payload['phoneNumber'] as string)?.trim() || undefined,
      callDate: formatDateForAPI(payload['callDate'] as string),
      callDuration: payload['callDuration']
        ? Number(payload['callDuration'])
        : undefined,
      callStatusId: payload['callStatusId']
        ? Number(payload['callStatusId'])
        : undefined,
      callOutcome: (payload['callOutcome'] as string)?.trim() || undefined,
      notes: (payload['notes'] as string)?.trim() || undefined,
      nextCall: formatDateForAPI(payload['nextCall'] as string),
    };

    this.callsService.createCall(callPayload).subscribe({
      next: (response) => {
        if (response?.succeeded) {
          this.notify.open({
            type: 'success',
            title: 'تم الحفظ',
            description: response?.message || 'تم تسجيل المكالمة بنجاح',
          });
          if (onSuccess) {
            onSuccess();
          }
        } else {
          const errorMessage =
            response?.message ||
            response?.errors?.join?.(' ') ||
            'تعذر حفظ المكالمة، يرجى المحاولة لاحقاً';

          this.notify.open({
            type: 'error',
            title: 'خطأ',
            description: errorMessage,
          });

          if (onError) {
            onError({ message: errorMessage });
          }
        }
      },
      error: (error) => {
        const errorMessage =
          error?.error?.message ||
          error?.error?.validationErrors?.[0]?.errorMessage ||
          error?.error?.errors?.join?.(' ') ||
          error?.message ||
          'تعذر حفظ المكالمة، يرجى المحاولة لاحقاً';

        this.notify.open({
          type: 'error',
          title: 'خطأ',
          description: errorMessage,
        });

        if (onError) {
          onError(error);
        }
      },
    });
  }
}
