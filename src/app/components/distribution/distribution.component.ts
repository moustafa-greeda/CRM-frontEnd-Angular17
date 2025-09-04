import { Component, OnDestroy, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { BehaviorSubject, Subject, combineLatest, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs/operators';
import { NotifyDialogService } from '../../shared/notify-dialog/notify-dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { DistributionService, LeadsQuery } from './distribution.service';
import { Idistribution } from '../../core/Models/distribution/idistribution';

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
    client_location: [''],
    city: [{ value: '', disabled: false }],
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
    isHaveSocialMedia: [null],
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
    // // الاشتراك في الـ Observable لتخزين البيانات في متغير clients
    // this.clientsService.clients$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((clients) => {
    //     this.clients = clients; // حفظ البيانات
    //   });
    // Countries
    this.clientsService
      .getCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countries$.next(countries));

    // Cities
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

    // Companies
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

    // Channels
    this.form.valueChanges
      .pipe(
        startWith(this.form.value),
        debounceTime(200),
        map((f) => {
          const q = this.mapToQuery(f) as any;
          const { entry_channel, entry_campaign, ...rest } = q;
          return rest as LeadsQuery;
        }),
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
        switchMap((q) => this.clientsService.getChannels(q)),
        takeUntil(this.destroy$)
      )
      .subscribe((channels) => {
        const list = channels.map((c) => ({
          entryChannel: (c.entryChannel || '').trim(),
          count: c.count,
        }));
        this.channels$.next(list);

        const current = (this.form.get('entry_channel')!.value || '').trim();
        const exists =
          !!current &&
          list.some(
            (c) => c.entryChannel.toLowerCase() === current.toLowerCase()
          );
        if (current && !exists) {
          this.form.get('entry_channel')!.setValue('', { emitEvent: false });
        }
      });

    this.form
      .get('entry_channel')!
      .valueChanges.pipe(
        startWith(this.form.value.entry_channel),
        debounceTime(200), // تأخير 200 ملي ثانية لتقليل عدد الطلبات
        distinctUntilChanged(), // لا ترسل الطلب إذا كانت القيمة لم تتغير
        switchMap((channel) => {
          if (!channel) return of([]); // إذا لم يتم اختيار قناة، نرجع قائمة فارغة
          // إذا كانت الحملات موجودة في التخزين المؤقت، نعرضها مباشرة
          if (this.campaigns$.value.length > 0) {
            return of(this.campaigns$.value);
          }
          // إذا لم تكن الحملات موجودة في التخزين المؤقت، نقوم بإرسال الطلب
          return this.clientsService.getCampaigns({ entry_channel: channel });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((campaigns) => {
        this.campaigns$.next(campaigns); // تحديث قائمة الحملات في التخزين المؤقت

        // إعادة تعيين الحملة إذا كانت لا توجد في الحملات الجديدة
        const currentCampaign = this.form.get('entry_campaign')!.value;
        const exists =
          !!currentCampaign &&
          campaigns.some((c) => c.entryCampaign === currentCampaign);
        if (currentCampaign && !exists) {
          this.form.get('entry_campaign')!.setValue('', { emitEvent: false });
        }
      });

    // Extra facets
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

    // Grid
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

  private mapToQuery(f: any): LeadsQuery {
    const toBool = (v: any) =>
      v === true || v === 'true'
        ? true
        : v === false || v === 'false'
        ? false
        : undefined;

    return {
      SearchKeyword: (f.search || '').trim() || undefined,
      client_location: (f.client_location || '').trim() || undefined,
      Region: ((f.city || f.region || '') as string).trim() || undefined,
      source_company: (f.source_company || '').trim() || undefined,
      entry_channel: (f.entry_channel || '').trim() || undefined,
      entry_campaign: (f.entry_campaign || '').trim() || undefined,
      client_category: (f.client_category || '').trim() || undefined,
      client_main_domain: (f.client_main_domain || '').trim() || undefined,
      client_sub_domain: (f.client_sub_domain || '').trim() || undefined,
      request_type: (f.request_type || '').trim() || undefined,
      gender: (f.gender || '').trim() || undefined,
      FeedbackStatus: f.feedbackStatus ?? undefined,
      IsHaveSocialMedia: toBool(f.isHaveSocialMedia),
      Mode:
        f.mode === '' || f.mode === null || f.mode === undefined
          ? undefined
          : (Number(f.mode) as 0 | 1),
      CreatedAt: (f.createdAt || '').trim() || undefined,
    };
  }
}

// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { NonNullableFormBuilder } from '@angular/forms';
// import { PageEvent } from '@angular/material/paginator';
// import { Sort } from '@angular/material/sort';
// import { BehaviorSubject, Subject, combineLatest, of } from 'rxjs';
// import {
//   debounceTime,
//   distinctUntilChanged,
//   map,
//   startWith,
//   switchMap,
//   takeUntil,
// } from 'rxjs/operators';
// import { NotifyDialogService } from '../../shared/notify-dialog/notify-dialog.service';
// import { MatDialog } from '@angular/material/dialog';
// import { DistributionService, LeadsQuery } from './distribution.service';
// import { Idistribution } from '../../core/Models/distribution/idistribution';

// interface AssignmentResponse {
//   succeeded: boolean;
//   message: string;
// }

// @Component({
//   selector: 'app-distribution',
//   templateUrl: './distribution.component.html',
//   styleUrls: ['./distribution.component.css'],
// })
// export class DistributionComponent implements OnInit, OnDestroy {
//   clients$ = this.clientsService.clients$;
//   totalCount$ = this.clientsService.totalCount$;

//   countries$ = new BehaviorSubject<{ clientLocation: string; count: number }[]>(
//     []
//   );
//   cities$ = new BehaviorSubject<string[]>([]);
//   companies$ = new BehaviorSubject<{ sourceCompany: string; count: number }[]>(
//     []
//   );
//   channels$ = new BehaviorSubject<{ entryChannel: string; count: number }[]>(
//     []
//   );
//   campaigns$ = new BehaviorSubject<{ entryCampaign: string; count: number }[]>(
//     []
//   );

//   categories$ = new BehaviorSubject<string[]>([]);
//   mainDomains$ = new BehaviorSubject<string[]>([]);
//   subDomains$ = new BehaviorSubject<string[]>([]);

//   selectedRows = new Set<number>();
//   isSelected: { [key: number]: boolean } = {};
//   clients: Idistribution[] = [];

//   form = this.fb.group({
//     search: [''],
//     client_location: [''],
//     city: [{ value: '', disabled: false }],
//     region: [''],
//     source_company: [''],
//     entry_channel: [''],
//     entry_campaign: [''],
//     client_category: [''],
//     client_main_domain: [''],
//     client_sub_domain: [''],
//     request_type: [''],
//     gender: [''],
//     feedbackStatus: [''],
//     isHaveSocialMedia: [null],
//     mode: ['0'],
//     createdAt: [''],
//   });

//   private page$ = new BehaviorSubject<{ index: number; size: number }>({
//     index: 0,
//     size: 10,
//   });
//   private sort$ = new BehaviorSubject<{
//     field: string;
//     dir: '' | 'asc' | 'desc';
//   }>({ field: '', dir: '' });
//   private destroy$ = new Subject<void>();

//   constructor(
//     private clientsService: DistributionService,
//     private fb: NonNullableFormBuilder,
//     private dialog: MatDialog,
//     private notify: NotifyDialogService
//   ) {}

//   ngOnInit(): void {
//     this.clientsService.clients$
//       .pipe(takeUntil(this.destroy$))
//       .subscribe((clients) => {
//         this.clients = clients;
//       });

//     this.clientsService
//       .getCountries()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe((countries) => this.countries$.next(countries));

//     this.form
//       .get('client_location')!
//       .valueChanges.pipe(
//         switchMap((country) => {
//           const cityCtrl = this.form.get('city')!;
//           cityCtrl.setValue('', { emitEvent: false });
//           if (!country) return of([] as string[]);
//           return this.clientsService.getCitiesByCountry(country);
//         }),
//         takeUntil(this.destroy$)
//       )
//       .subscribe((cities) => this.cities$.next(cities));

//     combineLatest([
//       this.form
//         .get('client_location')!
//         .valueChanges.pipe(startWith(this.form.value.client_location)),
//       this.form.get('city')!.valueChanges.pipe(startWith(this.form.value.city)),
//     ])
//       .pipe(
//         switchMap(([country, city]) =>
//           this.clientsService.getSourceCompaniesByLocation(
//             country || undefined,
//             city || undefined
//           )
//         ),
//         takeUntil(this.destroy$)
//       )
//       .subscribe((companies) => this.companies$.next(companies));

//     this.form.valueChanges
//       .pipe(
//         startWith(this.form.value),
//         debounceTime(200),
//         map((f) => {
//           const q = this.mapToQuery(f) as any;
//           const { entry_channel, entry_campaign, ...rest } = q;
//           return rest as LeadsQuery;
//         }),
//         distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
//         switchMap((q) => this.clientsService.getChannels(q)),
//         takeUntil(this.destroy$)
//       )
//       .subscribe((channels) => {
//         const list = channels.map((c) => ({
//           entryChannel: (c.entryChannel || '').trim(),
//           count: c.count,
//         }));
//         this.channels$.next(list);

//         const current = (this.form.get('entry_channel')!.value || '').trim();
//         const exists =
//           !!current &&
//           list.some(
//             (c) => c.entryChannel.toLowerCase() === current.toLowerCase()
//           );
//         if (current && !exists) {
//           this.form.get('entry_channel')!.setValue('', { emitEvent: false });
//         }
//       });
//   }

//   ngOnDestroy(): void {
//     this.destroy$.next();
//     this.destroy$.complete();
//   }

//   onPageChange(e: PageEvent) {
//     this.page$.next({ index: e.pageIndex, size: e.pageSize });
//   }

//   onSortChange(e: Sort) {
//     this.sort$.next({ field: e.active || '', dir: (e.direction as any) || '' });
//     this.page$.next({ index: 0, size: this.page$.value.size });
//   }

//   resetFilters() {
//     this.form.reset({
//       search: '',
//       client_location: '',
//       city: '',
//       region: '',
//       source_company: '',
//       entry_channel: '',
//       entry_campaign: '',
//       client_category: '',
//       client_main_domain: '',
//       client_sub_domain: '',
//       request_type: '',
//       gender: '',
//       feedbackStatus: '',
//       isHaveSocialMedia: null,
//       mode: '',
//       createdAt: '',
//     });
//     this.page$.next({ index: 0, size: this.page$.value.size });
//   }

//   private mapToQuery(f: any): LeadsQuery {
//     const toBool = (v: any) =>
//       v === true || v === 'true'
//         ? true
//         : v === false || v === 'false'
//         ? false
//         : undefined;

//     return {
//       SearchKeyword: (f.search || '').trim() || undefined,
//       client_location: (f.client_location || '').trim() || undefined,
//       Region: ((f.city || f.region || '') as string).trim() || undefined,
//       source_company: (f.source_company || '').trim() || undefined,
//       entry_channel: (f.entry_channel || '').trim() || undefined,
//       entry_campaign: (f.entry_campaign || '').trim() || undefined,
//       client_category: (f.client_category || '').trim() || undefined,
//       client_main_domain: (f.client_main_domain || '').trim() || undefined,
//       client_sub_domain: (f.client_sub_domain || '').trim() || undefined,
//       request_type: (f.request_type || '').trim() || undefined,
//       gender: (f.gender || '').trim() || undefined,
//       FeedbackStatus: f.feedbackStatus ?? undefined,
//       IsHaveSocialMedia: toBool(f.isHaveSocialMedia),
//       Mode:
//         f.mode === '' || f.mode === null || f.mode === undefined
//           ? undefined
//           : (Number(f.mode) as 0 | 1),
//       CreatedAt: (f.createdAt || '').trim() || undefined,
//     };
//   }

//   assignClientsToCompany(companyToName: string): void {
//     const clientIds = Array.from(this.selectedRows);
//     if (clientIds.length > 0) {
//       this.clientsService
//         .assignClientsToCompany(clientIds, companyToName)
//         .pipe(takeUntil(this.destroy$))
//         .subscribe((response) => {
//           if (response) {
//             console.log('تم تخصيص العملاء بنجاح');
//           } else {
//             console.error('فشل التخصيص:', response);
//           }
//         });
//     }
//   }

//   isAllSelected(): boolean {
//     const numSelected = this.selectedRows.size;
//     const numRows = this.clients.length;
//     return numSelected === numRows;
//   }

//   selectAllRows(event: any): void {
//     if (event.checked) {
//       this.selectedRows = new Set<number>(
//         this.clients.map((_, index) => index)
//       );
//     } else {
//       this.selectedRows.clear();
//     }
//   }

//   onSelectionChange(id: number): void {
//     const isChecked = this.isSelected[id];
//     if (isChecked) {
//       this.selectedRows.add(id);
//     } else {
//       this.selectedRows.delete(id);
//     }
//   }

//   isSomeSelected(): boolean {
//     const numSelected = this.selectedRows.size;
//     const numRows = this.clients.length;
//     return numSelected > 0 && numSelected < numRows;
//   }

//     displayedColumns: string[] = [
//     'select',
//     'index',
//     'clientName',
//     'clientPhone',
//     'requestType',
//     'entryCampaign',
//     'sourceCompany',
//     'clientCategory',
//     'entryChannel',
//     'client_main_domain',
//     'client_sub_domain',
//     'companyReceived',
//     'region',
//     'clientLocation',
//     'createdAt'
//   ];
// }
