import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardSalseService } from '../dashboard-salse.service';
import { AuthService } from '../../../Auth/auth.service';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';

@Injectable({
  providedIn: 'root',
})
export class LeadStatusEditorService {
  private readonly dashboardService = inject(DashboardSalseService);
  private readonly authService = inject(AuthService);
  private readonly notify = inject(NotifyDialogService);

  private editingLeadId: number | null = null;

  isEditing(leadId: number): boolean {
    return this.editingLeadId === leadId;
  }

  startEditing(lead: any): void {
    this.editingLeadId = lead.leadId;
    if (!lead.id && lead.leadId) {
      lead.id = lead.leadId;
    }
    // Store original values
    lead._originalLeadStatus = lead.leadStatus;
    lead._draftLeadStatus = lead.leadStatus;
    lead._originalAssignLeadId =
      lead.assignedLeadId ||
      lead.assignedToId ||
      lead.employeeId ||
      lead.assignedEmployeeId ||
      0;
  }

  cancelEditing(lead: any): void {
    lead.leadStatus = lead._originalLeadStatus || lead.leadStatus;
    lead.assignLeadId = lead._originalAssignLeadId || lead.assignLeadId;
    this.editingLeadId = null;
    delete lead._draftLeadStatus;
    delete lead._originalLeadStatus;
    delete lead._originalAssignLeadId;
  }

  onStatusChange(lead: any, newStatus: string): void {
    lead._draftLeadStatus = newStatus;
  }

  saveLeadStatus(lead: any): Observable<{
    success: boolean;
    newStatus: string;
    assignLeadId: number;
    needsAccountantAssignment: boolean;
  }> {
    const newStatus = lead._draftLeadStatus?.trim();
    const leadId = lead.leadId ?? lead.id;

    if (!leadId || !newStatus || newStatus === lead.leadStatus) {
      this.cancelEditing(lead);
      return new Observable((observer) => {
        observer.next({
          success: false,
          newStatus: lead.leadStatus,
          assignLeadId: lead.assignLeadId,
          needsAccountantAssignment: false,
        });
        observer.complete();
      });
    }

    const assignLeadId = lead.id || this.authService.getEmployeeId() || 1;

    const payload: any = {
      assignmentId: lead.assignmentId ?? lead.id,
      leadId: leadId,
      assignLeadId: assignLeadId,
      leadStatus: newStatus,
    };

    return this.dashboardService.editLeadStatus(payload).pipe(
      map((response) => {
        if (response && response.succeeded === true) {
          lead.leadStatus = newStatus;
          lead.assignLeadId = assignLeadId;
          this.editingLeadId = null;
          delete lead._draftLeadStatus;
          delete lead._originalLeadStatus;

          const needsAccountantAssignment = newStatus === 'Confirmed';

          this.notify.open({
            type: 'success',
            title: 'نجح',
            description: needsAccountantAssignment
              ? 'تم تحويل العميل الي قسم الحسابات'
              : 'تم تحديث حالة العميل المحتمل بنجاح',
          });

          return {
            success: true,
            newStatus,
            assignLeadId,
            needsAccountantAssignment,
          };
        } else {
          this.handleUpdateError(lead);
          return {
            success: false,
            newStatus: lead._originalLeadStatus,
            assignLeadId: lead._originalAssignLeadId,
            needsAccountantAssignment: false,
          };
        }
      })
    );
  }

  private handleUpdateError(lead: any, errorMsg?: string): void {
    lead.leadStatus = lead._originalLeadStatus;
    lead.assignLeadId = lead._originalAssignLeadId;
    this.cancelEditing(lead);

    this.notify.open({
      type: 'error',
      title: 'خطأ',
      description: errorMsg || 'فشل تحديث حالة العميل المحتمل',
    });
  }
}
