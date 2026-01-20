import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { FormUiComponent } from '../../../shared/components/form-ui/form-ui.component';
import { ActionTypeService } from './action-type.service';
import { ITeleSalseActionRequest } from '../../../core/Models/teleSalse/itele-salse-action';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';

@Injectable({
  providedIn: 'root',
})
export class TeleActionDialogService {
  private readonly dialog = inject(MatDialog);
  private readonly actionTypeService = inject(ActionTypeService);
  private readonly notify = inject(NotifyDialogService);

  openActionDialog(
    lead: any,
    actionTypeId: number,
    onSubmit: (data: ITeleSalseActionRequest) => void
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

    const fields: any[] = [
      {
        name: 'actionNotes',
        label: actionConfig.label,
        type: 'textarea',
        placeholder: actionConfig.placeholder,
        required: true,
        colSpan: 3,
      },
    ];

    // Add actionDate field for meeting and followup types
    if (actionConfig.type === 'meeting' || actionConfig.type === 'followup') {
      fields.push({
        name: 'actionDate',
        label: actionConfig.type === 'meeting' ? 'تاريخ الاجتماع' : 'تاريخ المتابعة',
        type: 'datetime-local',
        placeholder: `اختر تاريخ ووقت ال${actionConfig.name}`,
        required: actionConfig.type === 'meeting',
        colSpan: 3,
      });
    }

    const dialogRef = this.dialog.open(FormUiComponent, {
      width: '700px',
      panelClass: 'agreement-dialog',
      data: {
        config: {
          title: `إضافة ${actionConfig.name}`,
          submitText: 'حفظ',
          cancelText: 'إلغاء',
          fields: fields,
        },
        initialData: this.getInitialData(actionConfig.type),
      },
      hasBackdrop: true,
      backdropClass: 'agreement-dialog-backdrop',
    });

    const subscription = dialogRef.componentInstance.formSubmit.subscribe((formData) => {
      if (formData) {
        const requestData: ITeleSalseActionRequest = {
          leadId: lead.leadId,
          actionTypeId: actionTypeId,
          actionNotes: formData.actionNotes,
        };

        // Add actionDate if it's a meeting or followup type and provided
        if (
          (actionConfig.type === 'meeting' || actionConfig.type === 'followup') &&
          formData.actionDate
        ) {
          const date = new Date(formData.actionDate);
          requestData.actionDate = date.toISOString();
        }

        onSubmit(requestData);
        dialogRef.close();
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      subscription.unsubscribe();
    });
  }

  private getInitialData(type: string): any {
    const initialData: any = { actionNotes: '' };

    if (type === 'meeting' || type === 'followup') {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      initialData.actionDate = `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    return initialData;
  }
}
