// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { BehaviorSubject, of } from 'rxjs';
// import { catchError, map, tap } from 'rxjs/operators';
// import { environment } from '../../../environments/environment';
// import { Idistribution } from '../../core/Models/distribution/idistribution';

// interface PagedResponse<T> {
//   succeeded: boolean;
//   data: any;
//   warningErrors: any;
//   validationErrors: any[];
// }

// export interface LeadsQuery {
//   PageIndex?: number;
//   PageSize?: number;
//   SortField?: string;
//   SortDirection?: 'asc' | 'desc' | '';
//   SearchKeyword?: string;
//   source_company?: string;
//   client_location?: string;
//   entry_channel?: string;
//   entry_campaign?: string;
//   client_category?: string;
//   request_type?: string;
//   client_main_domain?: string;
//   client_sub_domain?: string;
//   FeedbackStatus?: number;
//   IsHaveSocialMedia?: boolean;
//   CreatedAt?: string;
//   gender?: string;
//   Region?: string;
//   Mode?: 0 | 1;
// }

// @Injectable({ providedIn: 'root' })
// export class DistributionService {
//   private readonly base = environment.apiUrl;
//   private readonly list$ = new BehaviorSubject<Idistribution[]>([]);
//   private readonly total$ = new BehaviorSubject<number>(0);

//   clients$ = this.list$.asObservable();
//   totalCount$ = this.total$.asObservable();

//   constructor(private http: HttpClient) {}

//   private toParams(obj: Record<string, any>): HttpParams {
//     // helper: converts an object to HttpParams, skipping empty values
//     let p = new HttpParams();
//     Object.entries(obj).forEach(([k, v]) => {
//       if (v === undefined || v === null || v === '') return;
//       p = p.set(k, String(v));
//     });
//     return p;
//   } // end: toParams

//   getCountries() {
//     // API: /Client/GetClientCountries -> [{ clientLocation, count }]
//     return this.http
//       .get<PagedResponse<any>>(`${this.base}/Client/GetClientCountries`)
//       .pipe(
//         map((res) => {
//           const root = res?.data ?? {};
//           const items = root.data ?? [];
//           return items.map((x: any) => ({
//             clientLocation: x.clientLocation,
//             count: x.count,
//           }));
//         }),
//         catchError(() => of([] as { clientLocation: string; count: number }[]))
//       );
//   } // end: getCountries

//   getCitiesByCountry(country: string) {
//     // API: /Client/GetClientCity?country=... -> string[]
//     const params = new HttpParams().set('country', country || '');
//     return this.http
//       .get<PagedResponse<string[]>>(`${this.base}/Client/GetClientCity`, {
//         params,
//       })
//       .pipe(
//         map((res) => (Array.isArray(res?.data) ? res.data : [])),
//         catchError(() => of([] as string[]))
//       );
//   } // end: getCitiesByCountry

//   // getSourceCompanies(q: LeadsQuery = {}) {
//   //   // API: /Client/GetAllSourceCompanies -> [{ sourceCompany|source_company, count }]
//   //   const { source_company, ...rest } = q as any; // exclude self-filter
//   //   const params = this.toParams(rest);

//   //   return this.http
//   //     .get<PagedResponse<any>>(`${this.base}/Client/GetAllSourceCompanies`, {
//   //       params,
//   //     })
//   //     .pipe(
//   //       map((res) =>
//   //         (Array.isArray(res?.data) ? res.data : []).map((x: any) => ({
//   //           sourceCompany: x.sourceCompany ?? x.source_company ?? '',
//   //           count: Number(x.count) || 0,
//   //         }))
//   //       ),
//   //       catchError(() => of([] as { sourceCompany: string; count: number }[]))
//   //     );
//   // } // end: getSourceCompanies

//   // يرجّع قائمة الشركات (source_company) — هذا الـ endpoint لا يقبل أي باراميترات
//   getSourceCompanies() {
//     return (
//       this.http
//         // .get<PagedResponse<any>>(`${this.base}/Client/GetAllSourceCompanies`)
//         .get<PagedResponse<any>>(`${this.base}/Client/GetAllSourceComapnies`)

//         .pipe(
//           map((res) =>
//             (Array.isArray(res?.data) ? res.data : []).map((x: any) => ({
//               sourceCompany: x.sourceCompany ?? x.source_company ?? '',
//               count: Number(x.count) || 0,
//             }))
//           ),
//           catchError((err) => {
//             console.error('getSourceCompanies error', err);
//             return of([] as { sourceCompany: string; count: number }[]);
//           })
//         )
//     );
//   }

//   getChannels(q: LeadsQuery = {}) {
//     // API: /Client/GetAllChanell -> [{ entryChannel, count }]
//     const { entry_channel, ...rest } = q as any; // exclude self-filter
//     const params = this.toParams(rest);

//     return this.http
//       .get<PagedResponse<any>>(`${this.base}/Client/GetAllChanell`, { params })
//       .pipe(
//         map((res) =>
//           (Array.isArray(res?.data) ? res.data : []).map((x: any) => ({
//             entryChannel: x.entryChannel,
//             count: Number(x.count) || 0,
//           }))
//         ),
//         catchError(() => of([] as { entryChannel: string; count: number }[]))
//       );
//   } // end: getChannels

//   getCampaigns(q: LeadsQuery = {}) {
//     // API: /Client/GetCampianSource -> treat "clientWebsite" as entryCampaign
//     const { entry_campaign, ...rest } = q as any; // exclude self-filter
//     const params = this.toParams(rest);

//     return this.http
//       .get<PagedResponse<any>>(`${this.base}/Client/GetCampianSource`, {
//         params,
//       })
//       .pipe(
//         map((res) =>
//           (Array.isArray(res?.data) ? res.data : []).map((x: any) => ({
//             entryCampaign: x.clientWebsite ?? x.entry_campaign ?? '',
//             count: Number(x.count) || 0,
//           }))
//         ),
//         catchError(() => of([] as { entryCampaign: string; count: number }[]))
//       );
//   } // end: getCampaigns

//   getAll(q: LeadsQuery = {}) {
//     // API: /Client/GetClientsWithDistributeFilter -> paged grid data
//     const params = this.toParams(q);

//     return this.http
//       .get<PagedResponse<Idistribution>>(
//         `${this.base}/Client/GetClientsWithDistributeFilter`,
//         { params }
//       )
//       .pipe(
//         map((res) => {
//           const root = res?.data ?? {};
//           const items =
//             root.items ??
//             root.data ??
//             root.result ??
//             (Array.isArray(root) ? root : []) ??
//             [];
//           const total =
//             root.totalCount ??
//             root.count ??
//             (Array.isArray(items) ? items.length : 0);

//           return { items: items as Idistribution[], total: Number(total) || 0 };
//         }),
//         tap(({ items, total }) => {
//           this.list$.next(items);
//           this.total$.next(total);
//         }),
//         catchError(() => {
//           this.list$.next([]);
//           this.total$.next(0);
//           return of({ items: [], total: 0 });
//         })
//       );
//   } // end: getAll

//   getAllItems(q: LeadsQuery = {}) {
//     // API: same as getAll but fetches big page for building secondary facets
//     const qForFacet: LeadsQuery = {
//       ...q,
//       PageIndex: 1,
//       PageSize: 10000,
//       SortField: undefined,
//       SortDirection: undefined,
//     };
//     const params = this.toParams(qForFacet);

//     return this.http
//       .get<PagedResponse<Idistribution>>(
//         `${this.base}/Client/GetClientsWithDistributeFilter`,
//         { params }
//       )
//       .pipe(
//         map((res) => {
//           const root = res?.data ?? {};
//           const items =
//             root.items ?? root.data ?? (Array.isArray(root) ? root : []) ?? [];
//           return items as Idistribution[];
//         }),
//         catchError(() => of([] as Idistribution[]))
//       );
//   } // end: getAllItems

//   buildFacets(items: Idistribution[]) {
//     // builds other “static” facets (campaign names list, categories, domains)
//     const uniq = (arr: any[]) => [...new Set(arr)].filter(Boolean);
//     return {
//       campaignsRaw: uniq((items as any[]).map((x) => x.entry_campaign)),
//       categoriesRaw: uniq((items as any[]).map((x) => x.client_category)),
//       mainDomainsRaw: uniq((items as any[]).map((x) => x.client_main_domain)),
//       subDomainsRaw: uniq((items as any[]).map((x) => x.client_sub_domain)),
//     };
//   } // end: buildFacets
// }

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
  client_location?: string; // country
  entry_channel?: string;
  entry_campaign?: string;
  client_category?: string;
  request_type?: string;
  client_main_domain?: string;
  client_sub_domain?: string;

  FeedbackStatus?: number;
  IsHaveSocialMedia?: boolean; // <— here
  CreatedAt?: string;
  gender?: string;
  Region?: string; // city
  Mode?: 0 | 1;
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

  /** New: source companies filtered by (country, city) — either or both */
  getSourceCompaniesByLocation(country?: string, city?: string) {
    let params = new HttpParams();
    if (country) params = params.set('country', country);
    if (city) params = params.set('city', city);

    // Use the correct endpoint name per Swagger: GetAllSourceCompanies
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

  // getChannels(q: LeadsQuery = {}) {
  //   const { entry_channel, ...rest } = q as any; // exclude self-filter
  //   const params = this.toParams(rest);

  //   return this.http
  //     .get<PagedResponse<any>>(`${this.base}/Client/GetAllChanell`, { params })
  //     .pipe(
  //       map((res) =>
  //         (Array.isArray(res?.data) ? res.data : []).map((x: any) => ({
  //           entryChannel: x.entryChannel,
  //           count: Number(x.count) || 0,
  //         }))
  //       ),
  //       catchError(() => of([] as { entryChannel: string; count: number }[]))
  //     );
  // }

  getChannels(q: LeadsQuery = {}) {
    const { entry_channel, source_company, client_location, ...rest } =
      q as any;
    const params = this.toParams(rest);

    return this.http
      .get<PagedResponse<any>>(`${this.base}/Client/GetAllChanell`, { params })
      .pipe(
        map((res) => {
          const channels = Array.isArray(res?.data) ? res.data : [];
          // تصفية القنوات التي تحتوي على بيانات (count > 0)
          return channels.filter((channel: any) => channel.count > 0);
        }),
        catchError(() => of([] as { entryChannel: string; count: number }[]))
      );
  }

  getCampaigns(q: LeadsQuery = {}) {
    const { entry_campaign, ...rest } = q as any; // exclude self-filter
    const params = this.toParams(rest);

    return this.http
      .get<PagedResponse<any>>(`${this.base}/Client/GetCampianSource`, {
        params,
      })
      .pipe(
        map((res) =>
          (Array.isArray(res?.data) ? res.data : []).map((x: any) => ({
            entryCampaign: x.clientWebsite ?? x.entry_campaign ?? '',
            count: Number(x.count) || 0,
          }))
        ),
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
}
