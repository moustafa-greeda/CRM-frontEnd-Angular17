import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  ILeads,
  ILeadsResponse,
  ILeadsSearchParams,
} from '../../../../core/Models/leads/ileads';
import { ILeadStatus } from '../../../../core/Models/common/ilead-status';
import { LeadsService } from '../../leads.service';
import { LeadStatusService } from '../../../../core/services/common/lead-status.service';

export interface LeadListResponse {
  leads: ILeads[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class LeadsDataService {
  // Signals for reactive state management
  private leads = signal<ILeads[]>([]);
  private leadStatusList = signal<ILeadStatus[]>([]);

  // Public readonly signals
  readonly leads$ = this.leads.asReadonly();
  readonly leadStatusList$ = this.leadStatusList.asReadonly();

  // Computed signals for derived data
  readonly leadStatusOptions = computed(() =>
    this.leadStatusList().map((status) => status.name)
  );

  constructor(
    private leadsService: LeadsService,
    private leadStatusService: LeadStatusService
  ) {}

  /**
   * Load lead status options
   */
  loadLeadStatusOptions(): Observable<ILeadStatus[]> {
    return this.leadStatusService.getAllLeadStatus().pipe(
      map((response) => {
        if (response.succeeded && response.data) {
          this.leadStatusList.set(response.data);
          return response.data;
        }
        // Fallback to default options
        const defaultStatuses: ILeadStatus[] = [
          { id: 1, name: 'تم التحويل' },
          { id: 2, name: 'لم يتم التحويل' },
        ];
        this.leadStatusList.set(defaultStatuses);
        return defaultStatuses;
      }),
      catchError(() => {
        // Fallback to default options on error
        const defaultStatuses: ILeadStatus[] = [
          { id: 1, name: 'تم التحويل' },
          { id: 2, name: 'لم يتم التحويل' },
        ];
        this.leadStatusList.set(defaultStatuses);
        return of(defaultStatuses);
      })
    );
  }

  /**
   * Search leads with filters
   */
  searchLeads(searchParams: ILeadsSearchParams): Observable<LeadListResponse> {
    return this.leadsService.SearchLeads(searchParams).pipe(
      map((response: ILeadsResponse) => {
        if (response.succeeded && response.data) {
          const leads = response.data.items || [];
          const totalCount = response.data.totalCount || 0;
          this.leads.set(leads);
          return {
            leads,
            totalCount,
          };
        }
        return { leads: [], totalCount: 0 };
      }),
      catchError(() => {
        this.leads.set([]);
        return of({ leads: [], totalCount: 0 });
      })
    );
  }

  /**
   * Get current leads
   */
  getCurrentLeads(): ILeads[] {
    return this.leads();
  }

  /**
   * Get current lead status list
   */
  getCurrentLeadStatusList(): ILeadStatus[] {
    return this.leadStatusList();
  }
}
