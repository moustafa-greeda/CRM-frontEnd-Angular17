import { Component, OnDestroy, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { BehaviorSubject, Subject, combineLatest, of } from 'rxjs';
import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { NotifyDialogService } from '../../shared/notify-dialog/notify-dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { DistributionService, LeadsQuery } from './distribution.service';

@Component({
  selector: 'app-distribution',
  templateUrl: './distribution.component.html',
  styleUrls: ['./distribution.component.css'],
})
export class DistributionComponent implements OnInit, OnDestroy {
  clients$ = this.clientsService.clients$;
  totalCount$ = this.clientsService.totalCount$;

  countries$ = new BehaviorSubject<{ clientLocation: string; count: number }[]>(
    []
  );
  cities$ = new BehaviorSubject<string[]>([]);
  companies$ = new BehaviorSubject<{ sourceCompany: string; count: number }[]>(
    []
  );
  channels$ = new BehaviorSubject<{ entryChannel: string; count: number }[]>(
    []
  );
  campaigns$ = new BehaviorSubject<{ entryCampaign: string; count: number }[]>(
    []
  );

  categories$ = new BehaviorSubject<string[]>([]);
  mainDomains$ = new BehaviorSubject<string[]>([]);
  subDomains$ = new BehaviorSubject<string[]>([]);

  form = this.fb.group({
    search: [''],

    client_location: [''], // country
    city: [{ value: '', disabled: false }], // city (Region)
    region: [''],

    source_company: [''],
    entry_channel: [''],
    entry_campaign: [''],

    client_category: [''],
    client_main_domain: [''],
    client_sub_domain: [''],
    request_type: [''],
    gender: [''],

    feedbackStatus: [''],
    isHaveSocialMedia: [null], // <— boolean filter

    mode: ['0'],
    createdAt: [''],
  });

  private page$ = new BehaviorSubject<{ index: number; size: number }>({
    index: 0,
    size: 10,
  });
  private sort$ = new BehaviorSubject<{
    field: string;
    dir: '' | 'asc' | 'desc';
  }>({ field: '', dir: '' });

  private destroy$ = new Subject<void>();

  constructor(
    private clientsService: DistributionService,
    private fb: NonNullableFormBuilder,
    private dialog: MatDialog,
    private notify: NotifyDialogService
  ) {}

  ngOnInit(): void {
    // Countries (load once)
    this.clientsService
      .getCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countries$.next(countries));

    // Cities depend on country (update immediately)
    this.form
      .get('client_location')!
      .valueChanges.pipe(
        switchMap((country) => {
          const cityCtrl = this.form.get('city')!;
          cityCtrl.setValue('', { emitEvent: false });
          if (!country) return of([] as string[]);
          return this.clientsService.getCitiesByCountry(country);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((cities) => this.cities$.next(cities));

    // Companies depend on (country, city)
    combineLatest([
      this.form
        .get('client_location')!
        .valueChanges.pipe(startWith(this.form.value.client_location)),
      this.form.get('city')!.valueChanges.pipe(startWith(this.form.value.city)),
    ])
      .pipe(
        switchMap(([country, city]) =>
          this.clientsService.getSourceCompaniesByLocation(
            country || undefined,
            city || undefined
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((companies) => this.companies$.next(companies));

    // Channels depend on current filters (excluding entry_channel itself)
    this.form.valueChanges
      .pipe(
        startWith(this.form.value),
        map((f) => this.mapToQuery(f)),
        map((q) => {
          const { entry_channel, ...rest } = q as any;
          return rest as LeadsQuery;
        }),
        switchMap((q) => this.clientsService.getChannels(q)),
        takeUntil(this.destroy$)
      )
      .subscribe((channels) => this.channels$.next(channels));

    // Campaigns depend on current filters (excluding entry_campaign itself)
    this.form.valueChanges
      .pipe(
        startWith(this.form.value),
        map((f) => this.mapToQuery(f)),
        map((q) => {
          const { entry_campaign, ...rest } = q as any;
          return rest as LeadsQuery;
        }),
        switchMap((q) => this.clientsService.getCampaigns(q)),
        takeUntil(this.destroy$)
      )
      .subscribe((campaigns) => this.campaigns$.next(campaigns));

    // Extra facets from full items
    this.form.valueChanges
      .pipe(
        startWith(this.form.value),
        map((f) => this.mapToQuery(f)),
        switchMap((q) => this.clientsService.getAllItems(q)),
        map((items) => this.clientsService.buildFacets(items)),
        takeUntil(this.destroy$)
      )
      .subscribe((f) => {
        this.categories$.next(f.categoriesRaw);
        this.mainDomains$.next(f.mainDomainsRaw);
        this.subDomains$.next(f.subDomainsRaw);
      });

    // Main grid (paging + sorting)
    combineLatest([
      this.form.valueChanges.pipe(startWith(this.form.value)),
      this.page$,
      this.sort$,
    ])
      .pipe(
        map(
          ([f, page, sort]) =>
            ({
              ...this.mapToQuery(f),
              PageIndex: page.index + 1,
              PageSize: page.size,
              SortField: sort.field || undefined,
              SortDirection: sort.dir || undefined,
            } as LeadsQuery)
        ),
        switchMap((q) => this.clientsService.getAll(q)),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageChange(e: PageEvent) {
    this.page$.next({ index: e.pageIndex, size: e.pageSize });
  }

  onSortChange(e: Sort) {
    this.sort$.next({ field: e.active || '', dir: (e.direction as any) || '' });
    this.page$.next({ index: 0, size: this.page$.value.size });
  }

  resetFilters() {
    this.form.reset({
      search: '',
      client_location: '',
      city: '',
      region: '',
      source_company: '',
      entry_channel: '',
      entry_campaign: '',
      client_category: '',
      client_main_domain: '',
      client_sub_domain: '',
      request_type: '',
      gender: '',
      feedbackStatus: '',
      isHaveSocialMedia: null,
      mode: '',
      createdAt: '',
    });
    this.page$.next({ index: 0, size: this.page$.value.size });
  }

  /** Map form -> API query, with clean boolean for IsHaveSocialMedia */
  private mapToQuery(f: any): LeadsQuery {
    const toBool = (v: any) =>
      v === true || v === 'true'
        ? true
        : v === false || v === 'false'
        ? false
        : undefined;

    return {
      SearchKeyword: (f.search || '').trim() || undefined,

      client_location: (f.client_location || '').trim() || undefined, // country
      Region: ((f.city || f.region || '') as string).trim() || undefined, // city/region

      source_company: (f.source_company || '').trim() || undefined,
      entry_channel: (f.entry_channel || '').trim() || undefined,
      entry_campaign: (f.entry_campaign || '').trim() || undefined,

      client_category: (f.client_category || '').trim() || undefined,
      client_main_domain: (f.client_main_domain || '').trim() || undefined,
      client_sub_domain: (f.client_sub_domain || '').trim() || undefined,
      request_type: (f.request_type || '').trim() || undefined,
      gender: (f.gender || '').trim() || undefined,

      FeedbackStatus: f.feedbackStatus ?? undefined,
      IsHaveSocialMedia: toBool(f.isHaveSocialMedia), // <— here

      Mode:
        f.mode === '' || f.mode === null || f.mode === undefined
          ? undefined
          : (Number(f.mode) as 0 | 1),

      CreatedAt: (f.createdAt || '').trim() || undefined,
    };
  }
}
