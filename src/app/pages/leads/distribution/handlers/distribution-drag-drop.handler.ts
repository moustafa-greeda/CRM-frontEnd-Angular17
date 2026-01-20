import {
  DistributionStateHandler,
  CustomerItem,
} from './distribution-state.handler';
import { NotifyDialogService } from '../../../../shared/components/notify-dialog-host/notify-dialog.service';
import { DistributionAssignmentHandler } from './distribution-assignment.handler';

/**
 * Handler for managing drag and drop functionality
 */
export class DistributionDragDropHandler {
  constructor(
    private state: DistributionStateHandler,
    private assignmentHandler: DistributionAssignmentHandler,
    private notify: NotifyDialogService
  ) {}

  /**
   * Handle drag over event
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.state.isDragOver.set(true);
  }

  /**
   * Handle drag leave event
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.state.isDragOver.set(false);
  }

  /**
   * Handle drop event
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.state.isDragOver.set(false);

    const selectedEmployee = this.state.selectedEmployee();
    if (!selectedEmployee) {
      this.notify.open({
        type: 'error',
        title: 'تحذير',
        description: 'يرجى اختيار موظف أولاً قبل سحب العناصر للتخصيص',
      });
      return;
    }

    const ids = this.extractIdsFromDrop(event);
    if (!ids || ids.length === 0) {
      this.notify.open({
        type: 'error',
        title: 'تحذير',
        description: 'لم يتم العثور على عناصر صالحة للسحب',
      });
      return;
    }

    if (this.assignmentHandler.wouldExceedLimit(ids.length)) {
      this.notify.open({
        type: 'error',
        title: 'حد التخصيص',
        description: `لا يمكن تخصيص أكثر من ${this.assignmentHandler.getMaxAssignments()} عنصر للموظف الواحد`,
      });
      return;
    }

    this.processDroppedItems(ids);
  }

  /**
   * Extract IDs from drop event
   */
  private extractIdsFromDrop(event: DragEvent): string[] {
    const json = event.dataTransfer?.getData('application/json');
    const text = event.dataTransfer?.getData('text/plain');
    let ids: string[] = [];

    try {
      if (json) {
        ids = JSON.parse(json);
      }
    } catch {
      // Ignore JSON parse errors
    }

    if (!ids || ids.length === 0) {
      if (text) {
        ids = [text];
      }
    }

    return ids;
  }

  /**
   * Process dropped items and add to assigned customers
   */
  private processDroppedItems(ids: string[]): void {
    const leadsList = this.state.leadsList();
    const assignedCustomers = this.state.assignedCustomers();
    const availableCustomers = this.state.availableCustomers();

    const toAssignBatch: CustomerItem[] = [];
    const alreadyAssigned: string[] = [];

    ids.forEach((id) => {
      // Try to find in leads list first
      const row = leadsList.find((r) => r.id.toString() === id.toString());
      if (row) {
        const candidate: CustomerItem = {
          id: row.id.toString(),
          name: row.name,
        };
        if (!assignedCustomers.find((c) => c.id === candidate.id)) {
          toAssignBatch.push(candidate);
        } else {
          alreadyAssigned.push(candidate.name);
        }
        return;
      }

      // Try to find in available customers
      const item = availableCustomers.find((c) => c.id === id);
      if (item && !assignedCustomers.find((c) => c.id === item.id)) {
        toAssignBatch.push(item);
      } else if (item) {
        alreadyAssigned.push(item.name);
      }
    });

    if (alreadyAssigned.length > 0) {
      this.notify.open({
        type: 'error',
        title: 'معلومة',
        description: `العناصر التالية مُخصصة بالفعل: ${alreadyAssigned.join(
          ', '
        )}`,
      });
    }

    if (toAssignBatch.length > 0) {
      this.state.assignedCustomers.update((current) => [
        ...current,
        ...toAssignBatch,
      ]);
    }
  }
}
