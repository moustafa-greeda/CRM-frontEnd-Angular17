import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  DetailViewDialogComponent,
  DetailViewDialogData,
} from '../../../shared/components/detail-view-dialog/detail-view-dialog.component';
import { DateUtilsService } from '../../../core/services/common/date-utils.service';
import { ActionTypeService } from './action-type.service';
import { ITeleSalseActionResponse } from '../../../core/Models/teleSalse/itele-salse-action';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';

@Injectable({
  providedIn: 'root',
})
export class LeadViewService {
  private readonly dialog = inject(MatDialog);
  private readonly dateUtils = inject(DateUtilsService);
  private readonly actionTypeService = inject(ActionTypeService);
  private readonly notify = inject(NotifyDialogService);

  /**
   * Show all actions for a specific lead in a dialog
   */
  showLeadActionsDialog(
    lead: any,
    teleSalesActions: ITeleSalseActionResponse | null
  ): void {
    const id = lead?.leadId ?? lead?.id;
    if (!id) {
      console.warn('showLeadActionsDialog: No leadId or id found', lead);
      return;
    }

    // Filter actions for this specific lead
    const leadActions = this.getLeadActions(id, teleSalesActions);

    if (leadActions.length === 0) {
      this.notify.open({
        type: 'error',
        title: 'لا توجد إجراءات',
        description: 'لا توجد إجراءات مسجلة لهذا العميل',
      });
      return;
    }

    // Format actions data for detail-view-dialog
    const { data, fields } = this.formatActionsData(leadActions, lead, id);

    const dialogData: DetailViewDialogData = {
      title: `إجراءات ${lead.contactName || lead.name || 'العميل'}`,
      data,
      fields,
    };

    this.dialog.open(DetailViewDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: dialogData,
      panelClass: 'agreement-dialog',
      hasBackdrop: true,
      backdropClass: 'agreement-dialog-backdrop',
    });
  }

  /**
   * Get all actions for a specific lead
   */
  private getLeadActions(
    leadId: number,
    teleSalesActions: ITeleSalseActionResponse | null
  ): any[] {
    return (
      teleSalesActions?.data?.actionsGrouped?.flatMap((group: any) =>
        group.actions
          .filter((action: any) => (action.leadId ?? action.id) === leadId)
          .map((action: any) => ({
            ...action,
            actionTypeName: group.actionTypeName,
            actionTypeId: group.actionTypeId,
          }))
      ) || []
    );
  }

  /**
   * Format actions data for the detail view dialog
   */
  private formatActionsData(
    leadActions: any[],
    lead: any,
    leadId: number
  ): { data: Record<string, any>; fields: any[] } {
    const actionsData: Record<string, any> = {};
    const fields: Array<{
      key: string;
      label: string;
      type?: 'text' | 'url' | 'email' | 'phone' | 'date' | 'boolean' | 'json';
    }> = [];

    // Add each action
    leadActions.forEach((action: any, index: number) => {
      const actionNumber = index + 1;
      const actionTypeName = this.actionTypeService.getActionName(action);
      const actionDate = this.formatActionDate(action.actionDate);

      // Create formatted action string
      const actionKey = `action_${actionNumber}`;
      const actionLabel = `إجراء ${actionNumber} - ${actionTypeName}`;

      let actionValue = `النوع: ${actionTypeName}\nالتاريخ: ${actionDate}`;
      if (action.actionNotes) {
        actionValue += `\nالملاحظات: ${action.actionNotes}`;
      }

      actionsData[actionKey] = actionValue;
      fields.push({
        key: actionKey,
        label: actionLabel,
        type: 'text' as const,
      });

      // Add actionDate as separate field with proper date/time formatting
      if (action.actionDate) {
        const actionDateKey = `actionDate_${actionNumber}`;
        const actionDateLabel = `تاريخ ووقت الإجراء ${actionNumber}`;
        actionsData[actionDateKey] = action.actionDate;
        fields.push({
          key: actionDateKey,
          label: actionDateLabel,
          type: 'date' as const,
        });
      }
    });

    // Add lead information at the top
    actionsData['leadName'] = lead.contactName || lead.name || 'غير محدد';
    actionsData['leadId'] = leadId;
    actionsData['totalActions'] = leadActions.length;

    fields.unshift(
      { key: 'leadName', label: 'اسم العميل', type: 'text' as const },
      { key: 'totalActions', label: 'إجمالي الإجراءات', type: 'text' as const }
    );

    return { data: actionsData, fields };
  }

  private formatActionDate(dateString: string): string {
    return dateString ? this.dateUtils.relativeTimeArabic(dateString) : '';
  }
}
