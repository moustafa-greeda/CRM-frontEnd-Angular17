import { Injectable, signal, computed } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  IGetAllInvoiceData,
  IGetAllInvoiceDataItem,
} from '../../../core/Models/invoices/Invoice';
import {
  InvoiceQueryParams,
  InvoicesService,
} from '../../../pages/pages-accountant/invoices/invoices.service';
import { InvoicesAdminService } from './invoices-admin.service';

export interface InvoiceListResponse {
  invoices: IGetAllInvoiceDataItem[];
  totalCount: number;
}

export interface InvoiceStats {
  totalInvoices: number;
  totalPaidInvoices: number;
  totalUnpaidInvoices: number;
  totalCancelledInvoices: number;
}

export interface StatsCard {
  title: string;
  count: number;
  icon: string;
}

@Injectable({
  providedIn: 'root',
})
export class InvoicesDataService {
  // Signals for reactive state management
  private invoices = signal<IGetAllInvoiceDataItem[]>([]);
  private stats = signal<InvoiceStats>({
    totalInvoices: 0,
    totalPaidInvoices: 0,
    totalUnpaidInvoices: 0,
    totalCancelledInvoices: 0,
  });

  // Public computed signals
  readonly invoices$ = this.invoices.asReadonly();
  readonly stats$ = this.stats.asReadonly();

  // Computed signals for derived data
  readonly statsCards = computed((): StatsCard[] => {
    const statsData = this.stats();
    return [
      {
        title: 'إجمالي الفواتير',
        count: statsData.totalInvoices,
        icon: 'bi bi-receipt',
      },
      {
        title: 'الفواتير المدفوعة',
        count: statsData.totalPaidInvoices,
        icon: 'bi bi-cash-stack',
      },
      {
        title: 'الفواتير غير المدفوعة',
        count: statsData.totalUnpaidInvoices,
        icon: 'bi bi-hourglass-split',
      },
      {
        title: 'الفواتير الملغاة',
        count: statsData.totalCancelledInvoices,
        icon: 'bi bi-slash-circle',
      },
    ];
  });

  constructor(
    private invoicesService: InvoicesService,
    private invoicesAdminService: InvoicesAdminService
  ) {}

  /**
   * Load all initial stats
   */
  loadAllStats(): Observable<InvoiceStats> {
    return forkJoin({
      totalInvoices: this.invoicesAdminService.getTotalInvoicesCard().pipe(
        catchError(() => of({ data: 0 })),
        map((res) => res?.data || 0)
      ),
      totalPaidInvoices: this.invoicesAdminService
        .getTotalPaidInvoicesCard()
        .pipe(
          catchError(() => of({ data: 0 })),
          map((res) => res?.data || 0)
        ),
      totalUnpaidInvoices: this.invoicesAdminService
        .getTotalUnpaidInvoicesCard()
        .pipe(
          catchError(() => of({ data: 0 })),
          map((res) => res?.data || 0)
        ),
    }).pipe(
      map(
        (responses: {
          totalInvoices: number;
          totalPaidInvoices: number;
          totalUnpaidInvoices: number;
        }) => {
          const statsData: InvoiceStats = {
            totalInvoices: responses.totalInvoices,
            totalPaidInvoices: responses.totalPaidInvoices,
            totalUnpaidInvoices: responses.totalUnpaidInvoices,
            totalCancelledInvoices: 0, // Not available in API yet
          };
          this.stats.set(statsData);
          return statsData;
        }
      )
    );
  }

  /**
   * Load invoices with filters
   */
  loadInvoices(query: InvoiceQueryParams): Observable<InvoiceListResponse> {
    return this.invoicesService.getAllInvoices(query).pipe(
      map((response) => {
        if (response.succeeded && response.data) {
          const invoices = response.data.items || [];
          const totalCount = response.data.totalCount || 0;
          this.invoices.set(invoices);
          return {
            invoices,
            totalCount,
          };
        }
        return { invoices: [], totalCount: 0 };
      }),
      catchError(() => {
        this.invoices.set([]);
        return of({ invoices: [], totalCount: 0 });
      })
    );
  }

  /**
   * Get current invoices
   */
  getCurrentInvoices(): IGetAllInvoiceDataItem[] {
    return this.invoices();
  }

  /**
   * Get current stats
   */
  getCurrentStats(): InvoiceStats {
    return this.stats();
  }
}
