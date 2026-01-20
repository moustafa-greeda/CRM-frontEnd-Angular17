import { DistributionStateHandler, CustomerItem } from './distribution-state.handler';
import { DistributionService } from '../distribution.service';
import { NotifyDialogService } from '../../../../shared/components/notify-dialog-host/notify-dialog.service';

/**
 * Handler for managing lead assignment logic
 */
export class DistributionAssignmentHandler {
  private readonly MAX_ASSIGNMENTS = 50;

  constructor(
    private state: DistributionStateHandler,
    private service: DistributionService,
    private notify: NotifyDialogService
  ) {}

  /**
   * Unassign a customer item
   */
  unassignCustomer(item: CustomerItem): void {
    const assigned = this.state.assignedCustomers();
    const available = this.state.availableCustomers();

    this.state.assignedCustomers.set(
      assigned.filter((c) => c.id !== item.id)
    );

    if (!available.find((c) => c.id === item.id)) {
      this.state.availableCustomers.set([item, ...available]);
    }
  }

  /**
   * Validate assignment before proceeding
   */
  private validateAssignment(): { valid: boolean; message?: string } {
    const selectedEmployee = this.state.selectedEmployee();
    const assignedCustomers = this.state.assignedCustomers();

    if (!selectedEmployee || !selectedEmployee.id) {
      return {
        valid: false,
        message: 'يرجى اختيار موظف أولاً قبل تأكيد التخصيص',
      };
    }

    if (!assignedCustomers || assignedCustomers.length === 0) {
      return {
        valid: false,
        message: 'لا توجد عناصر مخصصة للتأكيد',
      };
    }

    const invalidCustomers = assignedCustomers.filter(
      (c) => !c.id || isNaN(parseInt(c.id))
    );
    if (invalidCustomers.length > 0) {
      return {
        valid: false,
        message: 'بعض العناصر المخصصة تحتوي على معرفات غير صحيحة',
      };
    }

    if (isNaN(selectedEmployee.id!)) {
      return {
        valid: false,
        message: 'معرف الموظف غير صحيح',
      };
    }

    return { valid: true };
  }

  /**
   * Confirm and execute assignment
   */
  confirmAssignment(): void {
    const validation = this.validateAssignment();
    if (!validation.valid) {
      this.notify.open({
        type: 'error',
        title: 'تحذير',
        description: validation.message!,
      });
      return;
    }

    this.proceedWithAssignment();
  }

  /**
   * Execute the assignment API call
   */
  private proceedWithAssignment(): void {
    const selectedEmployee = this.state.selectedEmployee()!;
    const assignedCustomers = this.state.assignedCustomers();
    const leadsList = this.state.leadsList();

    const payload = assignedCustomers.map((c) => ({
      leadId: parseInt(c.id),
      teleSalesId: selectedEmployee.id!,
      statusName:
        leadsList.find((r) => r.id.toString() === c.id)?.leadStatusName || '',
      assignedAt: new Date().toISOString(),
      notes: 'string',
    }));

    this.state.isLoading.set(true);
    this.service.assignGroups(payload).subscribe({
      next: (response) => {
        this.state.isLoading.set(false);
        this.state.resetAssignmentState();
        // Note: The component will call loadLeads() after this method

        this.notify.open({
          type: 'success',
          title: 'تم التخصيص',
          description: `تم تخصيص ${payload.length} عنصر للموظف ${selectedEmployee.name} بنجاح`,
          autoCloseMs: 3000,
        });
      },
      error: (err) => {
        this.state.isLoading.set(false);
        console.error('Assignment error:', err);
        this.notify.open({
          type: 'error',
          title: 'فشل التخصيص',
          description: 'تم التخصيص من قبل بالفعل',
        });
      },
    });
  }

  /**
   * Get maximum assignments allowed
   */
  getMaxAssignments(): number {
    return this.MAX_ASSIGNMENTS;
  }

  /**
   * Check if assignment limit would be exceeded
   */
  wouldExceedLimit(additionalCount: number): boolean {
    return (
      this.state.assignedCustomers().length + additionalCount > this.MAX_ASSIGNMENTS
    );
  }
}
