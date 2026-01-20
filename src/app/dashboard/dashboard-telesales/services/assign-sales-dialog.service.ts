import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormUiComponent } from '../../../shared/components/form-ui/form-ui.component';
import { AssignLeadsToSalesRequest } from '../../../core/Models/teleSalse/tele-sales-dashboard.types';

@Injectable({
  providedIn: 'root',
})
export class AssignSalesDialogService {
  private readonly dialog = inject(MatDialog);

  openAssignDialog(
    lead: any,
    salesList: any[],
    currencyList: any[],
    onSubmit: (payload: AssignLeadsToSalesRequest[], closeDialog: () => void) => void
  ): void {
    const salesOptions = salesList.map((sales: any) => ({
      value: sales.id,
      label: sales.name,
    }));

    const currencyOptions = currencyList.map((currency: any) => ({
      value: currency.id,
      label: currency.currency,
    }));

    const dialogRef = this.dialog.open(FormUiComponent, {
      width: '700px',
      panelClass: 'agreement-dialog',
      data: {
        config: {
          title: 'تعيين العميل لموظف للمبيعات',
          submitText: 'حفظ',
          cancelText: 'إلغاء',
          fields: [
            {
              name: 'salesId',
              label: 'موظف المبيعات',
              type: 'select',
              options: salesOptions,
              required: true,
              placeholder: 'اختر موظف المبيعات',
              colSpan: 2,
            },
            {
              name: 'currencyId',
              label: 'العملة',
              type: 'select',
              options: currencyOptions,
              required: true,
              placeholder: 'اختر العملة',
              colSpan: 1,
            },
            {
              name: 'notes',
              label: 'الملاحظات',
              type: 'textarea',
              required: false,
              placeholder: 'أدخل الملاحظات...',
              colSpan: 3,
            },
          ],
        },
      },
    });

    const subscription = dialogRef.componentInstance.formSubmit.subscribe((formData) => {
      if (formData) {
        const payload: AssignLeadsToSalesRequest[] = [
          {
            leadId: lead.leadId || 0,
            salesId: Number(formData.salesId) || 0,
            notes: formData.notes || 'string',
            currencyId: Number(formData.currencyId) || 0,
            buddgetValue: 0,
          },
        ];

        // Pass closeDialog callback to allow closing after success
        onSubmit(payload, () => dialogRef.close());
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      subscription.unsubscribe();
    });
  }
}
