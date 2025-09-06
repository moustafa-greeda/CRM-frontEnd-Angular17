import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ILeads } from './../../core/Models/leads/ileads';

interface PagedResponse<T> {
  succeeded: boolean;
  data: any;
  warningErrors: any;
  validationErrors: any[];
}

/** Swagger param names (PascalCase) */
export interface LeadsQuery {
  PageIndex?: number;
  PageSize?: number;
  SortField?: string;
  SortDirection?: 'asc' | 'desc' | '';
  SearchKeyword?: string;
  SourceCompany?: string;
  ClientWebsite?: string;
  ClientLocation?: string;
  EntryChannel?: string;
  CampaignSource?: string;
  Region?: string;
}

@Injectable({ providedIn: 'root' })
export class LeadsService {
  private readonly base = environment.apiUrl;
  private readonly list$ = new BehaviorSubject<ILeads[]>([]);
  private readonly total$ = new BehaviorSubject<number>(0);

  clients$ = this.list$.asObservable();
  totalCount$ = this.total$.asObservable();

  constructor(private http: HttpClient) {}

  // generic object -> HttpParams (ignores empty)
  private toParams(obj: Record<string, any>): HttpParams {
    let p = new HttpParams();
    Object.entries(obj).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      p = p.set(k, String(v));
    });
    return p;
  }

  getAll(q: LeadsQuery = {}) {
    const params = this.toParams(q);

    return this.http
      .get<PagedResponse<ILeads>>(`${this.base}/Client/GetAllClients`, {
        params,
      })
      .pipe(
        map((res) => {
          const root = res?.data ?? {};
          const items =
            root.items ??
            root.data ??
            root.result ??
            (Array.isArray(root) ? root : []) ??
            [];
          const total =
            root.totalCount ??
            root.count ??
            (Array.isArray(items) ? items.length : 0);

          return { items: items as ILeads[], total: Number(total) || 0 };
        }),
        tap(({ items, total }) => {
          this.list$.next(items);
          this.total$.next(total);
        }),
        catchError((err) => {
          console.error('getAll clients error', err);
          this.list$.next([]);
          this.total$.next(0);
          return of({ items: [], total: 0 });
        })
      );
  }

  getAllItems(q: LeadsQuery = {}) {
    const qForFacet: LeadsQuery = {
      ...q,
      PageIndex: 1,
      PageSize: 100,
      SortField: undefined,
      SortDirection: undefined,
    };
    const params = this.toParams(qForFacet);

    return this.http
      .get<PagedResponse<ILeads>>(`${this.base}/Client/GetAllClients`, {
        params,
      })
      .pipe(
        map((res) => {
          const root = res?.data ?? {};
          const items =
            root.items ?? root.data ?? (Array.isArray(root) ? root : []) ?? [];
          return items as ILeads[];
        }),
        catchError((err) => {
          console.error('getAllItems error', err);
          return of([] as ILeads[]);
        })
      );
  }

  private facetCount<T extends Record<string, any>>(
    items: T[],
    key: keyof T
  ): Array<{ value: string; count: number }> {
    const m = new Map<string, number>();
    for (const it of items) {
      const v = String(it[key] ?? '').trim();
      if (!v) continue;
      m.set(v, (m.get(v) ?? 0) + 1);
    }
    return Array.from(m, ([value, count]) => ({ value, count })).sort((a, b) =>
      a.value.localeCompare(b.value, 'ar')
    );
  }

  buildFacets(items: ILeads[]) {
    return {
      countries: this.facetCount(items as any, 'clientLocation'),
      citiesRaw: Array.from(
        new Set(
          (items as any[])
            .map((x) => String(x.region ?? '').trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b, 'ar')),
      companies: this.facetCount(items as any, 'sourceCompany'),
      channels: this.facetCount(items as any, 'entryChannel'),
      sources: this.facetCount(items as any, 'clientWebsite'),
    };
  }
}
