import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DashboardTeleService } from '../dashboard.service';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';

@Injectable({
  providedIn: 'root',
})
export class LeadStatusEditorService {
  private readonly dashboardService = inject(DashboardTeleService);
  private readonly notify = inject(NotifyDialogService);

  readonly editingLeadId = signal<number | null>(null);
  readonly selectedLeadForEdit = signal<any | null>(null);

  /**
   * Start editing a lead's status
   */
  startEdit(lead: any): void {
    const id = lead.leadId;
    this.editingLeadId.set(id);
    
    if (!lead.id && lead.leadId) {
      lead.id = lead.leadId;
    }
    
    this.selectedLeadForEdit.set(lead);
    
    // Store original values for cancel
    lead._originalLeadStatus = lead.leadStatus;
    lead._draftLeadStatus = lead.leadStatus;
    lead._originalAssignLeadId =
      lead.assignedLeadId ||
      lead.assignedToId ||
      lead.employeeId ||
      lead.assignedEmployeeId ||
      0;
  }

  /**
   * Save the edited lead status
   */
  saveLeadStatus(lead: any, onSuccess?: () => void): void {
    const newStatus = lead._draftLeadStatus?.trim();
    const leadId = lead.leadId ?? lead.id;

    if (!leadId || !newStatus || newStatus === lead.leadStatus) {
      this.cancelEdit(lead);
      return;
    }

    const payload: any = {
      leadId: leadId,
      assignLeadId: leadId,
      leadStatus: newStatus,
    };

    this.dashboardService.editLeadStatus(payload).subscribe({
      next: (response) => {
        if (response && response.succeeded === true) {
          lead.leadStatus = newStatus;
          lead.assignLeadId = leadId;
          this.clearEditState(lead);

          this.notify.open({
            type: 'success',
            title: 'نجح',
            description: response.data || 'تم تحديث حالة العميل المحتمل بنجاح',
          });

          if (onSuccess) {
            onSuccess();
          }
        } else {
          this.handleUpdateError(lead);
        }
      },
      error: (error) => {
        console.error('API Error:', error);
        const errorMsg =
          error?.error?.validationErrors?.[0]?.errorMessage ||
          error?.error?.data ||
          error?.message ||
          'فشل تحديث حالة العميل المحتمل';
        this.handleUpdateError(lead, errorMsg);
      },
    });
  }

  /**
   * Cancel editing a lead's status
   */
  cancelEdit(lead: any): void {
    lead.leadStatus = lead._originalLeadStatus || lead.leadStatus;
    lead.assignLeadId = lead._originalAssignLeadId || lead.assignLeadId;
    this.clearEditState(lead);
  }

  /**
   * Check if a lead is being edited
   */
  isEditing(lead: any): boolean {
    return this.editingLeadId() === lead.id;
  }

  /**
   * Update the draft status value
   */
  onStatusChange(lead: any, newStatus: string): void {
    lead._draftLeadStatus = newStatus;
  }

  /**
   * Update the draft assignLeadId value
   */
  onAssignLeadIdChange(lead: any, newAssignLeadId: number): void {
    lead._draftAssignLeadId = newAssignLeadId;
  }

  /**
   * Clear edit state
   */
  private clearEditState(lead: any): void {
    this.editingLeadId.set(null);
    this.selectedLeadForEdit.set(null);
    delete lead._draftLeadStatus;
    delete lead._originalLeadStatus;
    delete lead._originalAssignLeadId;
  }

  /**
   * Handle update error
   */
  private handleUpdateError(lead: any, errorMsg?: string): void {
    lead.leadStatus = lead._originalLeadStatus;
    lead.assignLeadId = lead._originalAssignLeadId;
    this.cancelEdit(lead);

    this.notify.open({
      type: 'error',
      title: 'خطأ',
      description: errorMsg || 'فشل تحديث حالة العميل المحتمل',
    });
  }
}
