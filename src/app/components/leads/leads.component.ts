import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  takeUntil,
  Observable,
  of,
} from 'rxjs';
import { ILeads } from './../../core/Models/leads/ileads';
import { LeadsService, LeadsQuery } from './leads.service';
import { ILeadCity } from '../../core/Models/leads/ilead-filter';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.css'],
})
export class LeadsComponent implements OnInit, OnDestroy {
  clients$ = this.clientsService.clients$;
  totalCount$ = this.clientsService.totalCount$;

  pageIndex = 0; // MatPaginator is 0-based
  pageSize = 10;
  sortField = '';
  sortDir: 'asc' | 'desc' | '' = '';
  searchKeyword = '';

  // Dropdown data
  countries$ = this.clientsService.getCountries();
  cities$: Observable<ILeadCity[]> = of([]);
  companies$ = this.clientsService.getSourceCompanies();
  channels$ = this.clientsService.getChannels();
  campSources$ = this.clientsService.getCampSources();

  // Filters (names mapped to Swagger params in fetch())
  countryCtrl = new FormControl<string>(''); // ClientLocation
  cityCtrl = new FormControl<string>(''); // Region
  companyCtrl = new FormControl<string>(''); // SourceCompany
  channelCtrl = new FormControl<string>(''); // EntryChannel
  sourceCtrl = new FormControl<string>(''); // ClientWebsite
  searchCtrl = new FormControl<string>('', { nonNullable: true });

  columns = [
    {
      key: 'clientName',
      header: 'Client Name',
      get: (r: ILeads) => r.clientName,
    },
    {
      key: 'clientPhone',
      header: 'Client Phone',
      get: (r: ILeads) => r.clientPhone,
    },
    {
      key: 'additionPhone',
      header: 'Addition Phone',
      get: (r: ILeads) => r.additionPhone ?? '-',
    },
    {
      key: 'clientEmail',
      header: 'Client Email',
      get: (r: ILeads) => r.clientEmail ?? '-',
    },
    { key: 'gender', header: 'Gender', get: (r: ILeads) => r.gender ?? '-' },
    {
      key: 'entryCampaign',
      header: 'Entry Campaign',
      get: (r: ILeads) => r.entryCampaign ?? '-',
    },
    {
      key: 'entryChannel',
      header: 'Entry Channel',
      get: (r: ILeads) => r.entryChannel ?? '-',
    },
    {
      key: 'requestType',
      header: 'Request Type',
      get: (r: ILeads) => r.requestType ?? '-',
    },
    {
      key: 'clientWebsite',
      header: 'Client Website',
      get: (r: ILeads) => r.clientWebsite ?? '-',
    },
    {
      key: 'socialMediaLinks',
      header: 'Social Links',
      get: (r: ILeads) => r.socialMediaLinks ?? '-',
    },
    {
      key: 'clientCategory',
      header: 'Category',
      get: (r: ILeads) => r.clientCategory ?? '-',
    },
    {
      key: 'clientMainDomain',
      header: 'Main Domain',
      get: (r: ILeads) => r.clientMainDomain ?? '-',
    },
    {
      key: 'clientSubDomain',
      header: 'Sub Domain',
      get: (r: ILeads) => r.clientSubDomain ?? '-',
    },
    {
      key: 'clientLocation',
      header: 'Country',
      get: (r: ILeads) => r.clientLocation ?? '-',
    },
    { key: 'region', header: 'Region', get: (r: ILeads) => r.region ?? '-' },
    {
      key: 'entryText',
      header: 'Notes',
      get: (r: ILeads) => r.entryText ?? '-',
    },
    {
      key: 'createdAt',
      header: 'Created At',
      get: (r: ILeads) => new Date(r.createdAt).toLocaleString(),
    },
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private clientsService: LeadsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Country changed → reset city + load cities + fetch
    this.countryCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((country) => {
        this.cityCtrl.setValue(''); // important: avoid stale Region
        if (country) this.cities$ = this.clientsService.getCities(country);
        this.pageIndex = 0;
        this.fetch();
      });

    // Other filters → fetch
    this.cityCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.pageIndex = 0;
      this.fetch();
    });
    this.companyCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 0;
        this.fetch();
      });
    this.channelCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 0;
        this.fetch();
      });
    this.sourceCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageIndex = 0;
        this.fetch();
      });

    // Search
    this.searchCtrl.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.searchKeyword = term.trim();
        this.pageIndex = 0;
        this.fetch();
      });

    this.fetch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  resetFilters() {
    this.countryCtrl.setValue('');
    this.cityCtrl.setValue('');
    this.companyCtrl.setValue('');
    this.channelCtrl.setValue('');
    this.sourceCtrl.setValue('');
  }

  private fetch() {
    const q: LeadsQuery = {
      PageIndex: this.pageIndex + 1, // API is 1-based
      PageSize: this.pageSize,
      SortField: this.sortField || undefined,
      SortDirection: this.sortDir || undefined,
      SearchKeyword: this.searchKeyword || undefined,

      SourceCompany: this.companyCtrl.value || undefined,
      ClientLocation: this.countryCtrl.value || undefined,
      EntryChannel: this.channelCtrl.value || undefined,
      ClientWebsite: this.sourceCtrl.value || undefined,
      Region: this.cityCtrl.value || undefined,
    };

    this.clientsService.refresh(q);
  }

  onPageChange(ev: PageEvent) {
    this.pageIndex = ev.pageIndex; // 0-based from MatPaginator
    this.pageSize = ev.pageSize;
    this.fetch();
  }

  onSortChange(ev: Sort) {
    this.sortField = ev.active || '';
    this.sortDir = (ev.direction as 'asc' | 'desc') || '';
    this.pageIndex = 0;
    this.fetch();
  }

  sortBy(key: string) {
    if (this.sortField === key) {
      this.sortDir =
        this.sortDir === 'asc' ? 'desc' : this.sortDir === 'desc' ? '' : 'asc';
      if (this.sortDir === '') this.sortField = '';
    } else {
      this.sortField = key;
      this.sortDir = 'asc';
    }
    this.pageIndex = 0;
    this.fetch();
  }
}
