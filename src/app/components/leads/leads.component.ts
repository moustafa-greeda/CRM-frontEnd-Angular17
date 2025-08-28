// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
// import { Sort } from '@angular/material/sort';
// import { PageEvent } from '@angular/material/paginator';
// import { FormControl } from '@angular/forms';
// import {
//   debounceTime,
//   distinctUntilChanged,
//   Subject,
//   takeUntil,
//   Observable,
//   of,
// } from 'rxjs';
// import { ILeads } from './../../core/Models/leads/ileads';
// import { LeadsService, LeadsQuery } from './leads.service';
// import { ILeadCity } from '../../core/Models/leads/ilead-filter';

// @Component({
//   selector: 'app-leads',
//   templateUrl: './leads.component.html',
//   styleUrls: ['./leads.component.css'],
// })
// export class LeadsComponent implements OnInit, OnDestroy {
//   clients$ = this.clientsService.clients$;
//   totalCount$ = this.clientsService.totalCount$;

//   pageIndex = 0; // MatPaginator is 0-based
//   pageSize = 10;
//   sortField = '';
//   sortDir: 'asc' | 'desc' | '' = '';
//   searchKeyword = '';

//   // Dropdown data
//   countries$ = this.clientsService.getCountries();
//   cities$: Observable<ILeadCity[]> = of([]);
//   companies$ = this.clientsService.getSourceCompanies();
//   channels$ = this.clientsService.getChannels();
//   campSources$ = this.clientsService.getCampSources();

//   // Filters (names mapped to Swagger params in fetch())
//   countryCtrl = new FormControl<string>(''); // ClientLocation
//   cityCtrl = new FormControl<string>(''); // Region
//   companyCtrl = new FormControl<string>(''); // SourceCompany
//   channelCtrl = new FormControl<string>(''); // EntryChannel
//   sourceCtrl = new FormControl<string>(''); // ClientWebsite
//   searchCtrl = new FormControl<string>('', { nonNullable: true });

//   columns = [
//     {
//       key: 'clientName',
//       header: 'Client Name',
//       get: (r: ILeads) => r.clientName,
//     },
//     {
//       key: 'clientPhone',
//       header: 'Client Phone',
//       get: (r: ILeads) => r.clientPhone,
//     },
//     {
//       key: 'additionPhone',
//       header: 'Addition Phone',
//       get: (r: ILeads) => r.additionPhone ?? '-',
//     },
//     {
//       key: 'clientEmail',
//       header: 'Client Email',
//       get: (r: ILeads) => r.clientEmail ?? '-',
//     },
//     { key: 'gender', header: 'Gender', get: (r: ILeads) => r.gender ?? '-' },
//     {
//       key: 'entryCampaign',
//       header: 'Entry Campaign',
//       get: (r: ILeads) => r.entryCampaign ?? '-',
//     },
//     {
//       key: 'entryChannel',
//       header: 'Entry Channel',
//       get: (r: ILeads) => r.entryChannel ?? '-',
//     },
//     {
//       key: 'requestType',
//       header: 'Request Type',
//       get: (r: ILeads) => r.requestType ?? '-',
//     },
//     {
//       key: 'clientWebsite',
//       header: 'Client Website',
//       get: (r: ILeads) => r.clientWebsite ?? '-',
//     },
//     {
//       key: 'socialMediaLinks',
//       header: 'Social Links',
//       get: (r: ILeads) => r.socialMediaLinks ?? '-',
//     },
//     {
//       key: 'clientCategory',
//       header: 'Category',
//       get: (r: ILeads) => r.clientCategory ?? '-',
//     },
//     {
//       key: 'clientMainDomain',
//       header: 'Main Domain',
//       get: (r: ILeads) => r.clientMainDomain ?? '-',
//     },
//     {
//       key: 'clientSubDomain',
//       header: 'Sub Domain',
//       get: (r: ILeads) => r.clientSubDomain ?? '-',
//     },
//     {
//       key: 'clientLocation',
//       header: 'Country',
//       get: (r: ILeads) => r.clientLocation ?? '-',
//     },
//     { key: 'region', header: 'Region', get: (r: ILeads) => r.region ?? '-' },
//     {
//       key: 'entryText',
//       header: 'Notes',
//       get: (r: ILeads) => r.entryText ?? '-',
//     },
//     {
//       key: 'createdAt',
//       header: 'Created At',
//       get: (r: ILeads) => new Date(r.createdAt).toLocaleString(),
//     },
//   ];

//   private destroy$ = new Subject<void>();

//   constructor(
//     private clientsService: LeadsService,
//     private dialog: MatDialog
//   ) {}

//   ngOnInit(): void {
//     // Country changed → reset city + load cities + fetch
//     this.countryCtrl.valueChanges
//       .pipe(takeUntil(this.destroy$))
//       .subscribe((country) => {
//         this.cityCtrl.setValue(''); // important: avoid stale Region
//         if (country) this.cities$ = this.clientsService.getCities(country);
//         this.pageIndex = 0;
//         this.fetch();
//       });

//     // Other filters → fetch
//     this.cityCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
//       this.pageIndex = 0;
//       this.fetch();
//     });
//     this.companyCtrl.valueChanges
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(() => {
//         this.pageIndex = 0;
//         this.fetch();
//       });
//     this.channelCtrl.valueChanges
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(() => {
//         this.pageIndex = 0;
//         this.fetch();
//       });
//     this.sourceCtrl.valueChanges
//       .pipe(takeUntil(this.destroy$))
//       .subscribe(() => {
//         this.pageIndex = 0;
//         this.fetch();
//       });

//     // Search
//     this.searchCtrl.valueChanges
//       .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
//       .subscribe((term) => {
//         this.searchKeyword = term.trim();
//         this.pageIndex = 0;
//         this.fetch();
//       });

//     this.fetch();
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   resetFilters() {
//     this.countryCtrl.setValue('');
//     this.cityCtrl.setValue('');
//     this.companyCtrl.setValue('');
//     this.channelCtrl.setValue('');
//     this.sourceCtrl.setValue('');
//   }

//   private fetch() {
//     const q: LeadsQuery = {
//       PageIndex: this.pageIndex + 1, // API is 1-based
//       PageSize: this.pageSize,
//       SortField: this.sortField || undefined,
//       SortDirection: this.sortDir || undefined,
//       SearchKeyword: this.searchKeyword || undefined,

//       SourceCompany: this.companyCtrl.value || undefined,
//       ClientLocation: this.countryCtrl.value || undefined,
//       EntryChannel: this.channelCtrl.value || undefined,
//       ClientWebsite: this.sourceCtrl.value || undefined,
//       Region: this.cityCtrl.value || undefined,
//     };

//     this.clientsService.refresh(q);
//   }

//   onPageChange(ev: PageEvent) {
//     this.pageIndex = ev.pageIndex; // 0-based from MatPaginator
//     this.pageSize = ev.pageSize;
//     this.fetch();
//   }

//   onSortChange(ev: Sort) {
//     this.sortField = ev.active || '';
//     this.sortDir = (ev.direction as 'asc' | 'desc') || '';
//     this.pageIndex = 0;
//     this.fetch();
//   }

//   sortBy(key: string) {
//     if (this.sortField === key) {
//       this.sortDir =
//         this.sortDir === 'asc' ? 'desc' : this.sortDir === 'desc' ? '' : 'asc';
//       if (this.sortDir === '') this.sortField = '';
//     } else {
//       this.sortField = key;
//       this.sortDir = 'asc';
//     }
//     this.pageIndex = 0;
//     this.fetch();
//   }
// }
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { BehaviorSubject, Subject, combineLatest } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs/operators';
import { LeadsService, LeadsQuery } from './leads.service';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.css'],
})
export class LeadsComponent implements OnInit, OnDestroy {
  // جدول
  clients$ = this.clientsService.clients$;
  totalCount$ = this.clientsService.totalCount$;

  // القوائم الديناميكية (مطابقة للـ HTML بتاعك)
  countries$ = new BehaviorSubject<{ clientLocation: string; count: number }[]>(
    []
  );
  cities$ = new BehaviorSubject<string[]>([]); // ملاحظة: strings علشان الـ HTML الحالي
  companies$ = new BehaviorSubject<{ sourceCompany: string; count: number }[]>(
    []
  );
  channels$ = new BehaviorSubject<{ entryChannel: string; count: number }[]>(
    []
  );
  campSources$ = new BehaviorSubject<
    { clientWebsite: string; count: number }[]
  >([]);

  // فورم الفلاتر
  form = this.fb.group({
    country: [''], // ClientLocation
    city: [''], // Region
    company: [''], // SourceCompany
    channel: [''], // EntryChannel
    source: [''], // ClientWebsite
    search: [''], // SearchKeyword
  });

  // ترقيم + فرز
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
    private clientsService: LeadsService,
    private fb: NonNullableFormBuilder
  ) {}

  ngOnInit(): void {
    // 🔸 سلسلة إعادة الضبط (فلترة على اللي قبله)
    // تغيير الدولة: صَفّر (مدينة/شركة/قناة/مصدر) + ارجع لأول صفحة
    this.form
      .get('country')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.form.patchValue(
          { city: '', company: '', channel: '', source: '' },
          { emitEvent: true }
        );
        this.page$.next({ index: 0, size: this.page$.value.size });
      });

    // تغيير المدينة: صَفّر (شركة/قناة/مصدر)
    this.form
      .get('city')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.form.patchValue(
          { company: '', channel: '', source: '' },
          { emitEvent: true }
        );
        this.page$.next({ index: 0, size: this.page$.value.size });
      });

    // تغيير الشركة: صَفّر (قناة/مصدر)
    this.form
      .get('company')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.form.patchValue({ channel: '', source: '' }, { emitEvent: true });
        this.page$.next({ index: 0, size: this.page$.value.size });
      });

    // تغيير القناة: صَفّر (مصدر)
    this.form
      .get('channel')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.form.patchValue({ source: '' }, { emitEvent: true });
        this.page$.next({ index: 0, size: this.page$.value.size });
      });

    // البحث المؤجل
    this.form
      .get('search')!
      .valueChanges.pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() =>
        this.page$.next({ index: 0, size: this.page$.value.size })
      );

    // 🔸 استريم للفاسات (فلترة فقط بدون ترقيم/فرز) ← يبني القوائم حسب المختار
    this.form.valueChanges
      .pipe(
        startWith(this.form.value),
        map(
          (f) =>
            ({
              SearchKeyword: (f.search || '').trim() || undefined,
              ClientLocation: f.country || undefined,
              Region: f.city || undefined,
              SourceCompany: f.company || undefined,
              EntryChannel: f.channel || undefined,
              ClientWebsite: f.source || undefined,
            } as LeadsQuery)
        ),
        switchMap((q) => this.clientsService.getAllItems(q)),
        map((items) => this.clientsService.buildFacets(items)),
        takeUntil(this.destroy$)
      )
      .subscribe((f) => {
        this.countries$.next(
          f.countries.map((x) => ({ clientLocation: x.value, count: x.count }))
        );
        this.cities$.next(f.citiesRaw); // strings للـ HTML الحالي
        this.companies$.next(
          f.companies.map((x) => ({ sourceCompany: x.value, count: x.count }))
        );
        this.channels$.next(
          f.channels.map((x) => ({ entryChannel: x.value, count: x.count }))
        );
        this.campSources$.next(
          f.sources.map((x) => ({ clientWebsite: x.value, count: x.count }))
        );
      });

    // 🔸 استريم الجدول (فلترة + ترقيم + فرز)
    combineLatest([
      this.form.valueChanges.pipe(startWith(this.form.value)),
      this.page$,
      this.sort$,
    ])
      .pipe(
        map(
          ([f, page, sort]) =>
            ({
              PageIndex: page.index + 1,
              PageSize: page.size,
              SortField: sort.field || undefined,
              SortDirection: sort.dir || undefined,
              SearchKeyword: (f.search || '').trim() || undefined,
              ClientLocation: f.country || undefined,
              Region: f.city || undefined,
              SourceCompany: f.company || undefined,
              EntryChannel: f.channel || undefined,
              ClientWebsite: f.source || undefined,
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

  // handlers
  onPageChange(e: PageEvent) {
    this.page$.next({ index: e.pageIndex, size: e.pageSize });
  }

  onSortChange(e: Sort) {
    this.sort$.next({ field: e.active || '', dir: (e.direction as any) || '' });
    this.page$.next({ index: 0, size: this.page$.value.size });
  }

  resetFilters() {
    this.form.reset({
      country: '',
      city: '',
      company: '',
      channel: '',
      source: '',
      search: '',
    });
    this.page$.next({ index: 0, size: this.page$.value.size });
  }
}
