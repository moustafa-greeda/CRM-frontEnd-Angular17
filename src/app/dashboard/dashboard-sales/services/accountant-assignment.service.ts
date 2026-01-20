import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardSalseService } from '../dashboard-salse.service';
import { AuthService } from '../../../Auth/auth.service';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';

@Injectable({
  providedIn: 'root',
})
export class AccountantAssignmentService {
  private readonly dashboardService = inject(DashboardSalseService);
  private readonly authService = inject(AuthService);
  private readonly notify = inject(NotifyDialogService);

  assignToAccountant(
    lead: any,
    onSuccess: () => void
  ): void {
    const employeeId = this.authService.getEmployeeId();

    if (!employeeId) {
      console.error('Could not get employee ID');
      return;
    }

    if (!lead.budget || lead.budget == 0) {
      this.notify.open({
        type: 'error',
        title: ' (يرجي ادخال الميزانية قبل التعيين)خطأ',
        description: 'يرجي الذهاب الي الاجراءات > تعديل الميزانية',
      });
      return;
    }

    this.createAssignToAccount(lead, String(employeeId), onSuccess);
  }

  private createAssignToAccount(
    lead: any,
    assignedByEmp: string,
    onSuccess: () => void
  ): void {
    const leadId = lead.leadId;
    const notes = lead.actionNote || lead.notes || '';
    const budgetValue = Number(lead.budget) || 0;
    const currency = lead.currencyName || '';

    const payload = {
      assignedByEmp: assignedByEmp,
      leadId: leadId,
      notes: notes,
      buddgetValue: budgetValue,
      currncy: currency,
    };

    this.dashboardService.createAssignToAccount(payload).subscribe({
      next: (response) => {
        if (response && response.succeeded !== false) {
          this.updateLeadStatusToConfirmed(lead, assignedByEmp, onSuccess);
        }
      },
      error: (error) => {
        console.error('Error creating assign to account:', error);
        this.notify.open({
          type: 'error',
          title: 'خطأ',
          description: 'تعذر تعيين العميل للمحاسب',
        });
      },
    });
  }

  private updateLeadStatusToConfirmed(
    lead: any,
    assignedByEmp: string,
    onSuccess: () => void
  ): void {
    const leadId = lead.leadId ?? lead.id;
    const assignLeadId =
      lead.id || Number(assignedByEmp) || this.authService.getEmployeeId();

    const statusPayload: any = {
      assignmentId: lead.assignmentId ?? lead.id,
      leadId: leadId,
      assignLeadId: assignLeadId,
      leadStatus: 'Confirmed',
    };

    this.dashboardService.editLeadStatus(statusPayload).subscribe({
      next: (response) => {
        if (response && response.succeeded !== false) {
          this.notify.open({
            type: 'success',
            title: 'تم التعيين',
            description: 'تم تعيين العميل للمحاسب',
          });
          onSuccess();
        }
      },
      error: (error) => {
        console.error('Error updating lead status to Confirmed:', error);
        this.notify.open({
          type: 'error',
          title: 'تم التعيين',
          description:
            'تم تعيين العميل للمحاسب، لكن تعذر تحديث الحالة إلى Confirmed',
        });
        onSuccess();
      },
    });
  }
}
