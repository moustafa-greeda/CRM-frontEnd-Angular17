import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DashboardSalseService } from '../dashboard-salse.service';
import { AuthService } from '../../../Auth/auth.service';
import { GetTeleSalesTableDataRequest } from '../../../core/Models/teleSalse/get-tele-sales-table-data-request';
import { PacketService } from './packet.service';

export interface LeadsFilterState {
  searchTerm: string;
  selectedLeadStatusId: number;
  selectedLeadStatusName: string;
  selectedCountry: string;
  selectedCity: string;
  selectedActionDateFilter: string;
  currentPage: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root',
})
export class LeadsDataService {
  private readonly dashboardService = inject(DashboardSalseService);
  private readonly authService = inject(AuthService);
  private readonly packetService = inject(PacketService);

  private readonly allLeadsCacheSubject = new BehaviorSubject<any[]>([]);
  readonly allLeadsCache$ = this.allLeadsCacheSubject.asObservable();

  get allLeadsCache(): any[] {
    return this.allLeadsCacheSubject.value;
  }

  set allLeadsCache(value: any[]) {
    this.allLeadsCacheSubject.next(value);
  }

  loadLeadsData(
    username: string,
    filterState: LeadsFilterState,
    leadStatusOptions: string[],
    allPackets: any[],
    force: boolean = false
  ): Observable<{
    leadsList: any[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
  }> {
    const payload: GetTeleSalesTableDataRequest = {
      contactName: filterState.searchTerm || '',
      assigndate: '',
      leadStatus: filterState.selectedLeadStatusId
        ? String(filterState.selectedLeadStatusId)
        : '',
      country: '',
      city: '',
      lastActionTime: '',
      actionNote: '',
      pageIndex: filterState.currentPage,
      pageSize: filterState.pageSize,
    };

    return this.dashboardService.getLeadsBelongsToSales(payload).pipe(
      map((response) => {
        if (response && response.data) {
          const responseData = response.data as any;
          const items = Array.isArray(responseData.items)
            ? responseData.items
            : Array.isArray(responseData)
            ? responseData
            : [];

          // Sync paginator from backend response
          const apiPageIndex = Number(
            (responseData as any).pageIndex ?? (responseData as any).PageIndex
          );
          let currentPage = filterState.currentPage;
          if (!Number.isNaN(apiPageIndex) && apiPageIndex > 0) {
            currentPage = apiPageIndex;
          } else if (apiPageIndex === 0) {
            currentPage = 1;
          }

          const apiPageSize = Number(
            (responseData as any).pageSize ?? (responseData as any).PageSize
          );
          let pageSize = filterState.pageSize;
          if (!Number.isNaN(apiPageSize) && apiPageSize > 0) {
            pageSize = apiPageSize;
          }

          const totalCount = Number(
            (responseData as any).totalCount ??
              (responseData as any).TotalCount ??
              items.length ??
              0
          );

          // Process leads
          const leadsList = (items || []).map((lead: any) => {
            const rawStatus =
              lead.leadStatus || lead.leadstatus || lead.LeadStatus || '';

            let matchedStatus = rawStatus;
            if (rawStatus && leadStatusOptions.length > 0) {
              const found = leadStatusOptions.find(
                (opt) => opt.toLowerCase() === rawStatus.toLowerCase()
              );
              if (found) {
                matchedStatus = found;
              }
            }

            return this.packetService.attachPacketInfo(
              {
                ...lead,
                assignmentId: lead.id,
                leadId: lead.leadId || lead.id,
                assignDate: lead.assignDate || lead.assigndate || '',
                assigndate: lead.assignDate || lead.assigndate || '',
                lastActionTime: lead.lastActionTime || lead.assignDate || '',
                leadStatus: matchedStatus,
                city: lead.city || '',
                country: lead.country || '',
                actionNote: lead.notes || lead.actionNote || '',
              },
              allPackets
            );
          });

          // Update cache
          this.allLeadsCache = [...leadsList];

          return { leadsList, totalCount, currentPage, pageSize };
        } else {
          return {
            leadsList: [],
            totalCount: 0,
            currentPage: filterState.currentPage,
            pageSize: filterState.pageSize,
          };
        }
      })
    );
  }

  applyClientSideFilter(
    filterState: LeadsFilterState,
    leadStatusOptions: string[]
  ): { leadsList: any[]; totalCount: number } {
    if (this.allLeadsCache.length === 0) {
      return { leadsList: [], totalCount: 0 };
    }

    let filtered = [...this.allLeadsCache];

    // Search filter
    if (filterState.searchTerm?.trim()) {
      const term = filterState.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (lead) =>
          lead.contactName?.toLowerCase().includes(term) ||
          lead.actionNote?.toLowerCase().includes(term) ||
          lead.country?.toLowerCase().includes(term) ||
          lead.city?.toLowerCase().includes(term) ||
          lead.leadStatus?.toLowerCase().includes(term)
      );
    }

    // Lead status filter
    if (filterState.selectedLeadStatusId > 0) {
      const selectedStatus = leadStatusOptions[filterState.selectedLeadStatusId - 1];
      filtered = filtered.filter((lead) => lead.leadStatus === selectedStatus);
    }

    // Country filter
    if (filterState.selectedCountry) {
      filtered = filtered.filter(
        (lead) =>
          (lead.country || '').toLowerCase() ===
          filterState.selectedCountry.toLowerCase()
      );
    }

    // City filter
    if (filterState.selectedCity) {
      filtered = filtered.filter(
        (lead) =>
          (lead.city || '').toLowerCase() ===
          filterState.selectedCity.toLowerCase()
      );
    }

    // Action date filter
    if (
      filterState.selectedActionDateFilter &&
      filterState.selectedActionDateFilter !== '--'
    ) {
      const now = new Date();
      let fromDate: Date | null = null;
      if (filterState.selectedActionDateFilter === 'اليوم') {
        fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (filterState.selectedActionDateFilter === 'أمس') {
        fromDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 1
        );
      } else if (filterState.selectedActionDateFilter === 'آخر 7 أيام') {
        fromDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - 7
        );
      }

      if (fromDate) {
        filtered = filtered.filter((lead) => {
          const dt = lead.lastActionTime ? new Date(lead.lastActionTime) : null;
          return dt ? dt >= fromDate : false;
        });
      }
    }

    const totalCount = filtered.length;

    // Apply pagination
    const start = (filterState.currentPage - 1) * filterState.pageSize;
    const paginatedData = filtered.slice(start, start + filterState.pageSize);

    return { leadsList: paginatedData, totalCount };
  }

  tryGetContactNameByLeadId(leadId: number): string | null {
    const lead = this.allLeadsCache.find((l) => (l.leadId ?? l.id) === leadId);
    return lead?.contactName || lead?.name || null;
  }

  updateLeadInCache(leadId: number, updates: Partial<any>): void {
    const cached = this.allLeadsCache.find(
      (l) => (l.leadId ?? l.id) === leadId
    );
    if (cached) {
      Object.assign(cached, updates);
      this.allLeadsCache = [...this.allLeadsCache]; // Trigger update
    }
  }
}
