import { Injectable, signal } from '@angular/core';
import { GetAllCompaniseService } from '../../../core/services/common/companise.service';
import { ICreateCompany } from '../../../core/Models/common/icompanies';
import { NotifyDialogService } from '../../../shared/components/notify-dialog-host/notify-dialog.service';

@Injectable({
  providedIn: 'root',
})
export class CompanyCrudService {
  // Operation state signals
  private isCreating = signal<boolean>(false);
  private isUpdating = signal<boolean>(false);
  private isDeleting = signal<boolean>(false);

  // Public readonly signals
  readonly isCreating$ = this.isCreating.asReadonly();
  readonly isUpdating$ = this.isUpdating.asReadonly();
  readonly isDeleting$ = this.isDeleting.asReadonly();

  // Computed signal for any operation in progress
  readonly isOperationInProgress = signal<boolean>(false);

  constructor(
    private companiesService: GetAllCompaniseService,
    private notify: NotifyDialogService
  ) {}

  createCompany(
    formData: any,
    onSuccess: () => void,
    onComplete: () => void
  ): void {
    this.isCreating.set(true);
    this.isOperationInProgress.set(true);

    const payload = this.buildPayload(formData);

    this.companiesService.createCompany(payload).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.notify.success({
            title: 'نجاح',
            description: 'تم إنشاء الشركة بنجاح',
          });
          onSuccess();
        } else {
          this.notify.error({
            title: 'خطأ',
            description: response.message || 'فشل إنشاء الشركة',
          });
        }
        this.isCreating.set(false);
        this.isOperationInProgress.set(false);
        onComplete();
      },
      error: (error) => {
        this.notify.error({
          title: 'خطأ',
          description: error?.error?.message || 'حدث خطأ أثناء إنشاء الشركة',
        });
        this.isCreating.set(false);
        this.isOperationInProgress.set(false);
        onComplete();
      },
    });
  }

  updateCompany(
    companyId: number,
    formData: any,
    onSuccess: () => void,
    onComplete: () => void
  ): void {
    this.isUpdating.set(true);
    this.isOperationInProgress.set(true);

    const payload = this.buildPayload(formData, companyId);

    this.companiesService.updateCompany(payload).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          this.notify.success({
            title: 'نجاح',
            description: 'تم تحديث الشركة بنجاح',
          });
          onSuccess();
        } else {
          this.notify.error({
            title: 'خطأ',
            description: response.message || 'فشل تحديث الشركة',
          });
        }
        this.isUpdating.set(false);
        this.isOperationInProgress.set(false);
        onComplete();
      },
      error: (error) => {
        this.notify.error({
          title: 'خطأ',
          description: error?.error?.message || 'حدث خطأ أثناء تحديث الشركة',
        });
        this.isUpdating.set(false);
        this.isOperationInProgress.set(false);
        onComplete();
      },
    });
  }

  deleteCompany(companyId: number, onSuccess?: () => void): void {
    this.isDeleting.set(true);
    this.isOperationInProgress.set(true);

    // TODO: Implement delete functionality when API is available
    this.notify.error({
      title: 'تنبيه',
      description: 'حذف الشركة غير متاح حالياً.',
    });

    this.isDeleting.set(false);
    this.isOperationInProgress.set(false);

    // When delete API is ready, use this pattern:
    /*
    this.companiesService.deleteCompany(companyId).subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.notify.success({
            title: 'نجاح',
            description: 'تم حذف الشركة بنجاح',
          });
          onSuccess?.();
        } else {
          this.notify.error({
            title: 'خطأ',
            description: response.message || 'فشل حذف الشركة',
          });
        }
        this.isDeleting.set(false);
        this.isOperationInProgress.set(false);
      },
      error: (error) => {
        this.notify.error({
          title: 'خطأ',
          description: error?.error?.message || 'حدث خطأ أثناء حذف الشركة',
        });
        this.isDeleting.set(false);
        this.isOperationInProgress.set(false);
      },
    });
    */
  }

  private buildPayload(formData: any, companyId?: number): ICreateCompany {
    const phonePrefix = formData.phonePrefix || '';
    const phoneNumber = formData.phoneNumber || '';

    let fullPhoneNumber = '';
    if (phonePrefix && phoneNumber) {
      fullPhoneNumber = `${phonePrefix} ${phoneNumber}`;
    } else if (phoneNumber) {
      fullPhoneNumber = phoneNumber;
    } else if (phonePrefix) {
      fullPhoneNumber = phonePrefix;
    }

    return {
      ...(companyId && { id: companyId }),
      name: formData.companyName || formData.name || '',
      industeryId: formData.industeryId ?? 0,
      companySizeId: formData.companySizeId ?? 0,
      companyStageId: formData.companyStageId ?? 0,
      ownershipId: formData.ownershipId ?? 0,
      cityId: formData.cityId ?? 0,
      counteryId: formData.counteryId ?? 0,
      addressLine: formData.location || formData.addressLine || '',
      email: formData.email || '',
      phoneNumber: fullPhoneNumber,
    };
  }

  // Reset operation states (useful for cleanup)
  resetOperationStates(): void {
    this.isCreating.set(false);
    this.isUpdating.set(false);
    this.isDeleting.set(false);
    this.isOperationInProgress.set(false);
  }
}
