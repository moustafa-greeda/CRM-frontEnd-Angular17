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
import { NotifyDialogService } from '../../shared/notify-dialog/notify-dialog.service';
import { MatDialog } from '@angular/material/dialog';
import { ChatDialogComponent } from './chat/chat-dialog.component';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.css'],
})
export class LeadsComponent implements OnInit, OnDestroy {
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
  campSources$ = new BehaviorSubject<
    { clientWebsite: string; count: number }[]
  >([]);

  form = this.fb.group({
    country: [''], // ClientLocation
    city: [''], // Region
    company: [''], // SourceCompany
    channel: [''], // EntryChannel
    source: [''], // ClientWebsite
    search: [''], // SearchKeyword
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
    private clientsService: LeadsService,
    private fb: NonNullableFormBuilder,

    private _employeeService: LeadsService,
    private dialog: MatDialog,
    private notify: NotifyDialogService
  ) {}

  ngOnInit(): void {
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

    this.form
      .get('company')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.form.patchValue({ channel: '', source: '' }, { emitEvent: true });
        this.page$.next({ index: 0, size: this.page$.value.size });
      });

    this.form
      .get('channel')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.form.patchValue({ source: '' }, { emitEvent: true });
        this.page$.next({ index: 0, size: this.page$.value.size });
      });

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

  // dialog chat
  // dialog chat
  openDialog(): void {
    this.dialog.open(ChatDialogComponent, {
      width: '877px',
      height: '693px',
      panelClass: 'form-dialog--employee',
      data: { title: 'المساعد الذكي' },
      autoFocus: false,
    });
  }
}
