import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Idistribution } from '../../core/Models/distribution/idistribution';

interface PagedResponse<T> {
  succeeded: boolean;
  data: any;
  warningErrors: any;
  validationErrors: any[];
}

export interface LeadsQuery {
  PageIndex?: number;
  PageSize?: number;
  SortField?: string;
  SortDirection?: 'asc' | 'desc' | '';
  SearchKeyword?: string;

  source_company?: string;
  client_location?: string;
  entry_channel?: string;
  entry_campaign?: string;
  client_category?: string;
  request_type?: string;
  client_main_domain?: string;
  client_sub_domain?: string;

  FeedbackStatus?: number;
  IsHaveSocialMedia?: boolean;
  CreatedAt?: string;
  gender?: string;
  Region?: string;
  Mode?: 0 | 1 | 2;
}

@Injectable({ providedIn: 'root' })
export class DistributionService {
  private readonly base = environment.apiUrl;
  private readonly list$ = new BehaviorSubject<Idistribution[]>([]);
  private readonly total$ = new BehaviorSubject<number>(0);

  clients$ = this.list$.asObservable();
  totalCount$ = this.total$.asObservable();

  constructor(private http: HttpClient) {}

  private toParams(obj: Record<string, any>): HttpParams {
    let p = new HttpParams();
    Object.entries(obj).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      p = p.set(k, String(v));
    });
    return p;
  }

  getCountries() {
    return this.http
      .get<PagedResponse<any>>(`${this.base}/Client/GetClientCountries`)
      .pipe(
        map((res) => {
          const root = res?.data ?? {};
          const items = root.data ?? [];
          return items.map((x: any) => ({
            clientLocation: x.clientLocation,
            count: x.count,
          }));
        }),
        catchError(() => of([] as { clientLocation: string; count: number }[]))
      );
  }

  getCitiesByCountry(country: string) {
    const params = new HttpParams().set('country', country || '');
    return this.http
      .get<PagedResponse<string[]>>(`${this.base}/Client/GetClientCity`, {
        params,
      })
      .pipe(
        map((res) => (Array.isArray(res?.data) ? res.data : [])),
        catchError(() => of([] as string[]))
      );
  }

  getSourceCompaniesByLocation(country?: string, city?: string) {
    let params = new HttpParams();
    if (country) params = params.set('country', country);
    if (city) params = params.set('city', city);

    return this.http
      .get<PagedResponse<any>>(`${this.base}/Client/GetAllSourceCompanies`, {
        params,
      })
      .pipe(
        map((res) =>
          (Array.isArray(res?.data) ? res.data : []).map((x: any) => ({
            sourceCompany: x.sourceCompany ?? x.source_company ?? '',
            count: Number(x.count) || 0,
          }))
        ),
        catchError(() => of([] as { sourceCompany: string; count: number }[]))
      );
  }

  getChannels(q: LeadsQuery = {}) {
    const { entry_channel, entry_campaign, ...rest } = q as any;
    let params = this.toParams(rest);

    if (q.source_company)
      params = params.set('sourceCompany', q.source_company);
    if (q.client_location)
      params = params.set('clientLocation', q.client_location);
    if (q.Region) params = params.set('region', q.Region);

    return this.http
      .get<PagedResponse<any>>(`${this.base}/Client/GetAllChanell`, { params })
      .pipe(
        map((res) =>
          (Array.isArray(res?.data) ? res.data : []).map((x: any) => ({
            entryChannel: String(
              x.entryChannel ?? x.entry_channel ?? ''
            ).trim(),
            count: Number(x.count) || 0,
          }))
        ),
        catchError(() => of([] as { entryChannel: string; count: number }[]))
      );
  }

  getCampaigns(q: LeadsQuery = {}) {
    const { entry_campaign, ...rest } = q as any;

    const qForFacet: LeadsQuery = {
      ...rest,
      PageIndex: 1,
      PageSize: 10000,
    };

    const params = this.toParams(qForFacet);

    return this.http
      .get<PagedResponse<any>>(
        `${this.base}/Client/GetClientsWithDistributeFilter`,
        { params }
      )
      .pipe(
        map((res) => {
          const root = res?.data ?? {};
          const items = root.result ?? root.items ?? root.data ?? [];

          const counts = new Map<string, number>();
          (items as any[]).forEach((it) => {
            const key = String(it.entry_campaign ?? '').trim();
            if (!key) return;
            counts.set(key, (counts.get(key) ?? 0) + 1);
          });

          return Array.from(counts.entries()).map(([entryCampaign, count]) => ({
            entryCampaign,
            count,
          }));
        }),
        catchError(() => of([] as { entryCampaign: string; count: number }[]))
      );
  }

  getAll(q: LeadsQuery = {}) {
    const params = this.toParams(q);
    return this.http
      .get<PagedResponse<Idistribution>>(
        `${this.base}/Client/GetClientsWithDistributeFilter`,
        { params }
      )
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

          return { items: items as Idistribution[], total: Number(total) || 0 };
        }),
        tap(({ items, total }) => {
          this.list$.next(items);
          this.total$.next(total);
        }),
        catchError(() => {
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
      PageSize: 10000,
      SortField: undefined,
      SortDirection: undefined,
    };
    const params = this.toParams(qForFacet);

    return this.http
      .get<PagedResponse<Idistribution>>(
        `${this.base}/Client/GetClientsWithDistributeFilter`,
        { params }
      )
      .pipe(
        map((res) => {
          const root = res?.data ?? {};
          const items =
            root.items ?? root.data ?? (Array.isArray(root) ? root : []) ?? [];
          return items as Idistribution[];
        }),
        catchError(() => of([] as Idistribution[]))
      );
  }

  buildFacets(items: Idistribution[]) {
    const uniq = (arr: any[]) => [...new Set(arr)].filter(Boolean);
    return {
      campaignsRaw: uniq((items as any[]).map((x) => x.entry_campaign)),
      categoriesRaw: uniq((items as any[]).map((x) => x.client_category)),
      mainDomainsRaw: uniq((items as any[]).map((x) => x.client_main_domain)),
      subDomainsRaw: uniq((items as any[]).map((x) => x.client_sub_domain)),
    };
  }

  // ارسال IDs + اسم الشركة
  assignClientsToCompany(clientIds: number[], companyToName: string) {
    const body = { clientIds, companyToName };
    // غيّر المسار لو الباك إند عندكم مختلف
    return this.http
      .post<PagedResponse<any>>(`${this.base}/Client/edit-distribution`, body)
      .pipe(
        catchError((error) => {
          console.error('Error during assignment:', error);
          return of({
            succeeded: false,
            message: 'حدث خطأ أثناء التخصيص',
          } as any);
        })
      );
  }

  // تحديث الجدول محليًا بعد النجاح (اختياري)
  applyLocalAssignment(clientIds: number[], companyToName: string) {
    const updated = this.list$.value.map((r) =>
      clientIds.includes((r as any).id)
        ? ({ ...r, companyReceived: companyToName } as Idistribution)
        : r
    );
    this.list$.next(updated);
  }

  // ========================= get count of clients , destributed , not destributed ===========================

  getClientsCount() {
    return this.http
      .get<PagedResponse<number>>(`${this.base}/Client/count`)
      .pipe(
        map((res) => Number((res?.data as any) ?? 0)),
        catchError(() => of(0))
      );
  }
  getDistributedCount() {
    return this.http
      .get<PagedResponse<number>>(`${this.base}/Client/count/distributed`)
      .pipe(
        map((res) => Number((res?.data as any) ?? 0)),
        catchError(() => of(0))
      );
  }

  getNotDistributedCount() {
    return this.http
      .get<PagedResponse<number>>(`${this.base}/Client/count/not-distributed`)
      .pipe(
        map((res) => Number((res?.data as any) ?? 0)),
        catchError(() => of(0))
      );
  }
}
