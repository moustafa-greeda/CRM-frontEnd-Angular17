import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormUiComponent } from '../../../shared/components/form-ui/form-ui.component';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';
import { DashboardSalseService } from '../dashboard-salse.service';
import { ITeleSalseActionRequest } from '../../../core/Models/teleSalse/itele-salse-action';
import { SalesActionTypeService } from './action-type.service';

@Injectable({
  providedIn: 'root',
})
export class SalesActionDialogService {
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotifyDialogService);
  private readonly dashboardService = inject(DashboardSalseService);
  private readonly actionTypeService = inject(SalesActionTypeService);

  openActionDialog(
    lead: any,
    actionTypeId: number,
    onSuccess: (data: ITeleSalseActionRequest) => void
  ): void {
    const actionConfig = this.actionTypeService.getActionConfig(actionTypeId);

    if (!actionConfig) {
      this.notify.open({
        type: 'error',
        title: 'خطأ',
        description: 'نوع الإجراء غير معروف',
      });
      return;
    }

    const actionDialogConfig = {
      title: `إضافة ${actionConfig.name}`,
      submitText: 'حفظ',
      cancelText: 'إلغاء',
      fields: [
        {
          name: 'actionNotes',
          label: actionConfig.label,
          type: 'textarea',
          placeholder: actionConfig.placeholder,
          required: true,
          colSpan: 3,
        },
      ],
    };

    const dialogRef = this.dialog.open(FormUiComponent, {
      width: '700px',
      panelClass: 'agreement-dialog',
      data: {
        config: actionDialogConfig,
        initialData: {
          actionNotes: '',
        },
      },
    });

    dialogRef.componentInstance.formSubmit.subscribe((formData) => {
      if (formData) {
        const requestData: ITeleSalseActionRequest = {
          leadId: lead.leadId,
          actionTypeId: actionTypeId,
          actionNotes: formData.actionNotes,
        };

        this.dashboardService.createSalesAction(requestData).subscribe({
          next: (response: any) => {
            if (response.succeeded) {
              this.notify.open({
                type: 'success',
                title: 'تم بنجاح',
                description: 'تم إضافة الملاحظة بنجاح',
              });
              onSuccess(requestData);
              dialogRef.close();
            } else {
              this.notify.open({
                type: 'error',
                title: 'خطأ',
                description: response.message || 'حدث خطأ أثناء إضافة الملاحظة',
              });
            }
          },
          error: (error) => {
            let errorMessage = 'حدث خطأ أثناء إضافة الملاحظة';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }
            this.notify.open({
              type: 'error',
              title: 'خطأ',
              description: errorMessage,
            });
          },
        });
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      dialogRef.componentInstance.formSubmit.unsubscribe();
    });
  }
}
