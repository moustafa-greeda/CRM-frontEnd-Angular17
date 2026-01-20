import { Injectable, signal } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { LeadsService } from '../../leads.service';
import { NotifyDialogService } from '../../../../shared/components/notify-dialog-host/notify-dialog.service';
import { ILeads } from '../../../../core/Models/leads/ileads';

export interface CreateLeadResult {
  success: boolean;
  client: ILeads;
  response?: any;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class LeadsCrudService {
  // Operation state signals
  private isCreating = signal<boolean>(false);
  private isImporting = signal<boolean>(false);

  // Public readonly signals
  readonly isCreating$ = this.isCreating.asReadonly();
  readonly isImporting$ = this.isImporting.asReadonly();

  // Computed signal for any operation in progress
  readonly isOperationInProgress = signal<boolean>(false);

  constructor(
    private leadsService: LeadsService,
    private notify: NotifyDialogService
  ) {}

  /**
   * Create lead for a single client
   */
  createLeadForClient(
    client: ILeads,
    leadStatusLookupId: number = 1
  ): Observable<CreateLeadResult> {
    return this.leadsService.CreateLead(client.id, leadStatusLookupId).pipe(
      map((response: any) => ({ success: true, client, response })),
      catchError((error: any) => {
        // Extract error message from validationErrors or fallback to message
        const errorMessage =
          error?.error?.validationErrors?.[0]?.errorMessage ||
          'هذا العميل موجود بالفعل';

        // Show error notification for individual client
        this.notify.error({
          title: 'خطأ',
          description: `${client.name || 'العميل'}: ${errorMessage}`,
        });

        // Return error result instead of throwing
        return of({ success: false, client, error: errorMessage });
      })
    );
  }

  /**
   * Create leads for multiple clients
   */
  createLeadsForMultipleClients(
    clients: ILeads[],
    leadStatusLookupId: number = 1,
    onSuccess?: (successful: number, failed: number) => void,
    onError?: (error: any) => void
  ): void {
    if (clients.length === 0) {
      return;
    }

    this.isCreating.set(true);
    this.isOperationInProgress.set(true);

    // Create array of observables for all clients
    const createLeadObservables = clients.map((client) =>
      this.createLeadForClient(client, leadStatusLookupId)
    );

    // Wait for all requests to complete
    forkJoin(createLeadObservables).subscribe({
      next: (results) => {
        this.isCreating.set(false);
        this.isOperationInProgress.set(false);

        // Count successful and failed operations
        const successful = results.filter((r) => r.success).length;
        const failed = results.filter((r) => !r.success).length;

        if (successful > 0) {
          // Show success notification only if at least one succeeded
          this.notify.success({
            title: 'تم بنجاح!',
            description: `تم إنشاء ${successful} عميل محتمل بنجاح${
              failed > 0 ? ` (فشل ${failed} عميل)` : ''
            }!`,
          });
        }

        onSuccess?.(successful, failed);
      },
      error: (error) => {
        this.isCreating.set(false);
        this.isOperationInProgress.set(false);
        console.error('Error creating leads:', error);
        this.notify.error({
          title: 'خطأ',
          description: 'حدث خطأ أثناء إنشاء العملاء المحتملين',
        });
        onError?.(error);
      },
    });
  }

  /**
   * Import contacts from Excel file
   */
  importFromExcel(
    file: File,
    onSuccess?: () => void,
    onError?: (error: any) => void
  ): void {
    // Validate file type
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name
      .substring(file.name.lastIndexOf('.'))
      .toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      this.notify.error({
        title: 'خطأ في نوع الملف',
        description: 'يرجى اختيار ملف Excel بصيغة .xlsx أو .xls',
      });
      return;
    }

    this.isImporting.set(true);
    this.isOperationInProgress.set(true);

    this.leadsService.importFromExcel(file).subscribe({
      next: (response) => {
        this.isImporting.set(false);
        this.isOperationInProgress.set(false);

        // Check if response has succeeded property
        if (response && response.statusCode === 200) {
          this.notify.success({
            title: 'نجاح',
            description: response.message || 'تم استيراد البيانات بنجاح',
          });
          onSuccess?.();
        } else {
          this.notify.error({
            title: 'فشل الاستيراد',
            description:
              response?.message || 'حدث خطأ أثناء استيراد البيانات',
          });
        }
      },
      error: (error) => {
        this.isImporting.set(false);
        this.isOperationInProgress.set(false);
        console.error('Error importing from Excel:', error);

        // Handle different error formats
        let errorMessage = 'حدث خطأ أثناء استيراد البيانات من ملف Excel';

        if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.error?.errors) {
          errorMessage = Array.isArray(error.error.errors)
            ? error.error.errors.join(', ')
            : String(error.error.errors);
        } else if (error?.message) {
          errorMessage = error.message;
        }

        this.notify.error({
          title: 'فشل الاستيراد',
          description: errorMessage,
        });
        onError?.(error);
      },
    });
  }

  // Reset operation states (useful for cleanup)
  resetOperationStates(): void {
    this.isCreating.set(false);
    this.isImporting.set(false);
    this.isOperationInProgress.set(false);
  }
}
