import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DashboardSalseService } from '../dashboard-salse.service';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';
import { FormUiComponent } from '../../../shared/components/form-ui/form-ui.component';
import { PacketOption } from '../models/sales.types';

@Injectable({
  providedIn: 'root',
})
export class BudgetManagementService {
  private readonly dashboardService = inject(DashboardSalseService);
  private readonly dialog = inject(MatDialog);
  private readonly notify = inject(NotifyDialogService);

  openBudgetEditDialog(
    lead: any,
    allPackets: PacketOption[],
    onSuccess: (newBudget: number) => void
  ): void {
    const id = lead.id;
    if (!id) return;

    const dialogRef = this.dialog.open(FormUiComponent, {
      width: '500px',
      panelClass: 'agreement-dialog',
      data: {
        config: {
          title: 'تحديث الميزانية',
          submitText: 'حفظ',
          cancelText: 'إلغاء',
          fields: [
            {
              name: 'budget',
              label: 'الميزانية',
              type: 'select',
              options: allPackets.map((packet) => ({
                label: packet.name,
                value: packet.id,
              })),
              required: true,
              placeholder: 'أدخل الميزانية',
              colSpan: 3,
            },
          ],
        },
        initialData: {
          budget: lead.budget,
        },
      },
    });

    dialogRef.componentInstance.formSubmit.subscribe((formData) => {
      const value = Number(formData?.budget);
      if (!Number.isFinite(value) || value < 0) {
        this.notify.open({
          type: 'error',
          title: 'خطأ',
          description: 'يرجى إدخال ميزانية صحيحة',
        });
        return;
      }

      this.dashboardService.updateSalesBudget(id, value).subscribe({
        next: () => {
          lead.budget = value;
          this.notify.open({
            type: 'success',
            title: 'تم بنجاح',
            description: 'تم تحديث الميزانية بنجاح',
          });
          dialogRef.close();
          onSuccess(value);
        },
        error: (error) => {
          const msg =
            error?.error?.validationErrors?.[0]?.errorMessage ||
            error?.error?.message ||
            error?.message ||
            'فشل تحديث الميزانية';
          this.notify.open({ type: 'error', title: 'خطأ', description: msg });
        },
      });
    });

    dialogRef.afterClosed().subscribe(() => {
      dialogRef.componentInstance.formSubmit.unsubscribe();
    });
  }

  updatePacketSelection(
    row: any,
    packet: PacketOption | null,
    allPackets: PacketOption[],
    onSuccess: (packetPrice: number) => void,
    onError: () => void
  ): void {
    const previousPacketId = row.packetId ?? null;
    const previousPacket = row.packet;

    const packetIdValue =
      packet?.id === undefined || packet?.id === null
        ? null
        : typeof packet.id === 'string'
        ? Number(packet.id)
        : packet.id;
    const normalizedPacketId =
      typeof packetIdValue === 'number' && !Number.isNaN(packetIdValue)
        ? packetIdValue
        : null;

    row.packetId = normalizedPacketId;
    row.packet = packet;

    const assignmentId = row?.id ?? row?.leadId ?? row?.assignmentId;
    if (!assignmentId || normalizedPacketId === null) {
      row.packetId = previousPacketId;
      row.packet = previousPacket;
      this.notify.open({
        type: 'error',
        title: 'خطأ',
        description: 'يجب اختيار باقة صالحة لتحديث الميزانية.',
      });
      return;
    }

    const selectedPacket =
      allPackets.find(
        (opt) => (opt.id ?? null) === (normalizedPacketId ?? null)
      ) || null;
    const packetPrice = Number(selectedPacket?.price ?? NaN);

    this.dashboardService
      .updateSalesBudget(assignmentId, normalizedPacketId)
      .subscribe({
        next: () => {
          if (Number.isFinite(packetPrice)) {
            row.budget = packetPrice;
          }

          this.notify.open({
            type: 'success',
            title: 'تم التحديث',
            description: 'تم تحديث الميزانية بناءً على الباقة المختارة.',
          });

          onSuccess(packetPrice);
        },
        error: () => {
          row.packetId = previousPacketId;
          row.packet = previousPacket;
          this.notify.open({
            type: 'error',
            title: 'خطأ',
            description: 'تعذر تحديث الميزانية، يرجى المحاولة لاحقاً.',
          });
          onError();
        },
      });
  }
}
