import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ILeads } from './../../core/Models/leads/ileads';
import {
  ICampSource,
  IChannel,
  ILeadCity,
  ILeadCountry,
  ISourceCompany,
} from '../../core/Models/leads/ilead-filter';

interface PagedResponse<T> {
  succeeded: boolean;
  data: { totalCount: number; items: T[] };
  warningErrors: any;
  validationErrors: any[];
}

/** Use Swagger param names (PascalCase) */
export interface LeadsQuery {
  PageIndex?: number;
  PageSize?: number;
  SortField?: string;
  SortDirection?: 'asc' | 'desc' | '';
  SearchKeyword?: string;

  SourceCompany?: string;
  ClientName?: string;
  ClientPhone?: string;
  AdditionPhone?: string;
  ClientEmail?: string;
  ClientWebsite?: string;
  SocialMediaLinks?: string;
  ClientCategory?: string;
  ClientLocation?: string;
  EntryText?: string;
  EntryChannel?: string;
  EntryCampaign?: string;
  Gender?: string;
  RequestType?: string;
  ClientMainDomain?: string;
  ClientSubDomain?: string;
  Region?: string;
  CreatedAtFrom?: Date | string;
  CreatedAtTo?: Date | string;
  Id?: number;
}

@Injectable({ providedIn: 'root' })
export class LeadsService {
  private readonly base = environment.apiUrl;
  private readonly list$ = new BehaviorSubject<ILeads[]>([]);
  private readonly total$ = new BehaviorSubject<number>(0);

  clients$ = this.list$.asObservable();
  totalCount$ = this.total$.asObservable();

  constructor(private http: HttpClient) {}

  /** Paged + sorted + filtered */
  getAll(q: LeadsQuery = {}) {
    // تعريف معلمات الـ HTTP Params
    let hp = new HttpParams();

    // تعيين المعلمات بناءً على المعطيات التي تأتي من الكود
    if (q.PageIndex) hp = hp.set('PageIndex', String(q.PageIndex));
    if (q.PageSize) hp = hp.set('PageSize', String(q.PageSize));
    if (q.SortField) hp = hp.set('SortField', q.SortField);
    if (q.SortDirection) hp = hp.set('SortDirection', q.SortDirection);
    if (q.SearchKeyword) hp = hp.set('SearchKeyword', q.SearchKeyword);
    if (q.SourceCompany) hp = hp.set('SourceCompany', q.SourceCompany);
    if (q.ClientName) hp = hp.set('ClientName', q.ClientName);
    if (q.ClientPhone) hp = hp.set('ClientPhone', q.ClientPhone);
    if (q.AdditionPhone) hp = hp.set('AdditionPhone', q.AdditionPhone);
    if (q.ClientEmail) hp = hp.set('ClientEmail', q.ClientEmail);
    if (q.ClientWebsite) hp = hp.set('ClientWebsite', q.ClientWebsite);
    if (q.SocialMediaLinks) hp = hp.set('SocialMediaLinks', q.SocialMediaLinks);
    if (q.ClientCategory) hp = hp.set('ClientCategory', q.ClientCategory);
    if (q.ClientLocation) hp = hp.set('ClientLocation', q.ClientLocation);
    if (q.EntryText) hp = hp.set('EntryText', q.EntryText);
    if (q.EntryChannel) hp = hp.set('EntryChannel', q.EntryChannel);
    if (q.EntryCampaign) hp = hp.set('EntryCampaign', q.EntryCampaign);
    if (q.Gender) hp = hp.set('Gender', q.Gender);
    if (q.RequestType) hp = hp.set('RequestType', q.RequestType);
    if (q.ClientMainDomain) hp = hp.set('ClientMainDomain', q.ClientMainDomain);
    if (q.ClientSubDomain) hp = hp.set('ClientSubDomain', q.ClientSubDomain);
    if (q.Region) hp = hp.set('Region', q.Region);
    if (q.CreatedAtFrom) hp = hp.set('CreatedAtFrom', String(q.CreatedAtFrom));
    if (q.CreatedAtTo) hp = hp.set('CreatedAtTo', String(q.CreatedAtTo));
    if (q.Id) hp = hp.set('Id', String(q.Id));

    // إرسال الطلب إلى الـ API
    return this.http
      .get<PagedResponse<ILeads>>(`${this.base}/Client/GetAllClients`, {
        params: hp,
      })
      .pipe(
        map((res) => {
          const items = res?.data?.items ?? [];
          const total = res?.data?.totalCount ?? 0;
          return { items, total };
        }),
        catchError((err) => {
          console.error('getAll clients error', err);
          return of({ items: [], total: 0 });
        }),
        tap(({ items, total }) => {
          // تحديث البيانات في BehaviorSubject
          this.list$.next(items);
          this.total$.next(total);
        })
      );
  }

  refresh(q?: LeadsQuery) {
    this.getAll(q).subscribe();
  }

  // ---------- lookups ----------

  /** Countries (Swagger returns data.data; sometimes clientlocation in lower-case) */
  getCountries(): Observable<ILeadCountry[]> {
    return this.http.get<any>(`${this.base}/Client/GetClientCountries`).pipe(
      map((res) => {
        const arr = res?.data?.data ?? [];
        return arr.map((x: any) => ({
          clientLocation: x.clientlocation ?? x.clientLocation ?? '',
          count: x.count ?? 0,
        })) as ILeadCountry[];
      }),
      catchError((err) => {
        console.error('Error loading countries', err);
        return of([]);
      })
    );
  }

  /** Cities by country (?country=) */
  getCities(country: string): Observable<ILeadCity[]> {
    return this.http
      .get<any>(`${this.base}/Client/GetClientCity`, { params: { country } })
      .pipe(
        map((res) => res?.data ?? []),
        catchError((err) => {
          console.error('Error loading cities', err);
          return of([]);
        })
      );
  }

  /** Correct endpoint for source companies */
  getSourceCompanies(): Observable<ISourceCompany[]> {
    return this.http.get<any>(`${this.base}/Client/GetAllSourceComapnies`).pipe(
      map((res) => res?.data ?? []),
      catchError((err) => {
        console.error('Error loading source companies', err);
        return of([]);
      })
    );
  }

  getChannels(): Observable<IChannel[]> {
    return this.http.get<any>(`${this.base}/Client/GetAllChanell`).pipe(
      map((res) => res?.data ?? []),
      catchError((err) => {
        console.error('Error loading channels', err);
        return of([]);
      })
    );
  }

  /** Campaign source (clientWebsite) */
  getCampSources(): Observable<ICampSource[]> {
    return this.http.get<any>(`${this.base}/Client/GetCampianSource`).pipe(
      map((res) => res?.data ?? []),
      catchError((err) => {
        console.error('Error loading campaign sources', err);
        return of([]);
      })
    );
  }
}
