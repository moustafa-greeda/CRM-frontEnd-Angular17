import { Component, OnDestroy, OnInit } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { BehaviorSubject, Subject, combineLatest, of } from 'rxjs';
import { debounceTime, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { NotifyDialogService } from '../../shared/notify-dialog/notify-dialog.service';
import { DistributionService, LeadsQuery } from './distribution.service';
import { Idistribution } from '../../core/Models/distribution/idistribution';
import { FormDialogComponent } from '../../shared/form/form-dialog/form-dialog.component';
import { IDepartments } from '../../core/Models/departments/idepartments.model';
import { DepartmentsService } from './../departments/departments.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-distribution',
  templateUrl: './distribution.component.html',
  styleUrls: ['./distribution.component.css'],
})
export class DistributionComponent implements OnInit, OnDestroy {
  clients$ = this.clientsService.clients$;
  totalCount$ = this.clientsService.totalCount$;
  // cout of clients
  clientsCount$ = this.clientsService.getClientsCount();
  DistributedCount$ = this.clientsService.getDistributedCount();
  notDistributedCount$ = this.clientsService.getNotDistributedCount();

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
  allCountries: { name: string }[] = [];

  // assign to company
  selectedRows = new Set<number>();
  isSelected: { [key: number]: boolean } = {};
  clients: Idistribution[] = [];

  //show and hide filter
  showFilters = false;
  private firstLoad = true; 

  form = this.fb.group({
    search: [''],
    region: [''],
    client_location: [''],
    city: [{ value: '', disabled: true }],
    source_company: [{ value: '', disabled: true }],
    entry_channel: [{ value: '', disabled: true }],
    entry_campaign: [{ value: '', disabled: true }],

    client_category: [''],
    client_main_domain: [''],
    client_sub_domain: [''],
    request_type: [''],
    gender: [''],
    feedbackStatus: [''],
    isHaveSocialMedia: [null],
    mode: ['0'],
    createdAt: [''],
    assign_company: [{ value: '', disabled: true }],
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
    private dialog: MatDialog,
    private clientsService: DistributionService,
    private fb: NonNullableFormBuilder,
    private notify: NotifyDialogService
  ) {}

  ngOnInit(): void {
    // عشان نخزن الداتا في clients[]
    this.clientsService.clients$
      .pipe(takeUntil(this.destroy$))
      .subscribe((rows) => {
        this.clients = rows;
        const assignCtrl = this.form.get('assign_company')!;
        if (this.clients.length === 0) assignCtrl.disable({ emitEvent: false });
        else assignCtrl.enable({ emitEvent: false });
      });

    this.form
      .get('mode')!
      .valueChanges.pipe(
        debounceTime(0),
        // startWith(this.form.value.mode),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.applyFilters());

    this.clientsService.GetAllCountries().subscribe((data) => {
      this.allCountries = data;
    });

    // نجيب الدول ونحطها في الـ dropdown
    this.clientsService
      .getCountries()
      .pipe(takeUntil(this.destroy$))
      .subscribe((countries) => this.countries$.next(countries));

    // جهز الفلاتر كلها من البداية (cities, companies, channels, campaigns)
    this.setupFilters();

    // أول ما يفتح الكومبوننت، رجعلي بيانات الجدول
    this.applyFilters();

    // ================== Assign to company ==================
    this.form
      .get('assign_company')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((company) => {
        if (!company) return;

        const ids = Array.from(this.selectedRows);
        if (ids.length === 0) {
          this.notify.error({
            title: 'لم يتم اختيار أي صف',
            description: 'اختر صفوفًا من الجدول أولًا قبل التخصيص.',
            imageUrl: 'assets/logo_elbatt.png',
            soundUrl: 'assets/sound/duck.mp3',
            autoCloseMs: 3000,
          });
          this.form.get('assign_company')!.setValue('', { emitEvent: false });
          return;
        }

        this.clientsService
          .assignClientsToCompany(ids, company)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res: any) => {
              if (res?.succeeded === true) {
                this.clientsService.applyLocalAssignment(
                  ids,
                  company as string
                );
                //update count
                this.clientsCount$ = this.clientsService.getClientsCount();
                this.DistributedCount$ =
                  this.clientsService.getDistributedCount();
                this.DistributedCount$ =
                  this.clientsService.getDistributedCount();

                this.notDistributedCount$ =
                  this.clientsService.getNotDistributedCount();

                const msg = res?.data?.message || 'تم تخصيص العملاء بنجاح.';
                this.notify.success({
                  title: 'تم بنجاح',
                  description: msg,
                  imageUrl: 'assets/logo_elbatt.png',
                  soundUrl: 'assets/sound/duck.mp3',
                  autoCloseMs: 3000,
                });

                this.selectedRows.clear();
                this.isSelected = {};
                this.form
                  .get('assign_company')!
                  .setValue('', { emitEvent: false });
                // Reload table data after assignment
                this.applyFilters();
              } else {
                this.notify.error({
                  title: 'فشل التخصيص',
                  description: res?.message || 'حدث خطأ أثناء التخصيص.',
                  imageUrl: 'assets/logo_elbatt.png',
                  soundUrl: 'assets/sound/duck.mp3',
                  autoCloseMs: 3000,
                });
              }
            },
            error: () => {
              this.notify.error({
                title: 'خطأ في الشبكة',
                description: 'تعذر الاتصال بالخادم.',
                imageUrl: 'assets/logo_elbatt.png',
                soundUrl: 'assets/sound/duck.mp3',
                autoCloseMs: 3000,
              });
            },
          });
      });
  }

  private setupFilters() {
    // Cities
    this.form
      .get('client_location')!
      .valueChanges.pipe(
        takeUntil(this.destroy$),
        switchMap((country) => {
          const cityCtrl = this.form.get('city')!;
          cityCtrl.setValue('', { emitEvent: false });
          if (!country) {
            this.cities$.next([]);
            cityCtrl.disable({ emitEvent: false });
            return of([]);
          }
          cityCtrl.enable({ emitEvent: false });
          return this.clientsService.getCitiesByCountry(country);
        })
      )
      .subscribe((cities) => this.cities$.next(cities));

    // Companies
    this.form
      .get('city')!
      .valueChanges.pipe(
        takeUntil(this.destroy$),
        switchMap((city) => {
          const companyCtrl = this.form.get('source_company')!;
          companyCtrl.setValue('', { emitEvent: false });
          if (!city) {
            this.companies$.next([]);
            companyCtrl.disable({ emitEvent: false });
            return of([]);
          }
          companyCtrl.enable({ emitEvent: false });
          const country = this.form.get('client_location')!.value;
          return this.clientsService.getSourceCompaniesByLocation(
            country,
            city
          );
        })
      )
      .subscribe((companies) => this.companies$.next(companies));

    // Channels
    this.form
      .get('source_company')!
      .valueChanges.pipe(
        takeUntil(this.destroy$),
        switchMap((company) => {
          const channelCtrl = this.form.get('entry_channel')!;
          channelCtrl.setValue('', { emitEvent: false });
          if (!company) {
            this.channels$.next([]);
            channelCtrl.disable({ emitEvent: false });
            return of([]);
          }
          channelCtrl.enable({ emitEvent: false });
          return this.clientsService.getChannels({ source_company: company });
        })
      )
      .subscribe((channels) => this.channels$.next(channels));

    // Campaigns
    this.form
      .get('entry_channel')!
      .valueChanges.pipe(
        takeUntil(this.destroy$),
        switchMap((channel) => {
          const campaignCtrl = this.form.get('entry_campaign')!;
          campaignCtrl.setValue('', { emitEvent: false });
          if (!channel) {
            this.campaigns$.next([]);
            campaignCtrl.disable({ emitEvent: false });
            return of([]);
          }
          campaignCtrl.enable({ emitEvent: false });
          return this.clientsService.getCampaigns({ entry_channel: channel });
        })
      )
      .subscribe((campaigns) => this.campaigns$.next(campaigns));
  }
  // ==================================== applyFilters function  ====================================
  applyFilters() {
    const filters = this.mapToQuery(this.form.value);

    const query: LeadsQuery = {
      ...filters,
      PageIndex: this.page$.value.index + 1,
      PageSize: this.page$.value.size,
      SortField: this.sort$.value.field || undefined,
      SortDirection: this.sort$.value.dir || undefined,
    };

    // get all clients
    this.clientsService
      .getAll(query)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // skip notify on first load
          if (!this.firstLoad) {
            this.notify.success({
              title: 'تم بنجاح',
              description: 'تم الفلتر بنجاح',
              imageUrl: 'assets/logo_elbatt.png',
              soundUrl: 'assets/sound/duck.mp3',
              autoCloseMs: 2000,
            });
          }
          this.firstLoad = false; // mark first load as complete
        },
        error: () => {
          this.notify.error({
            title: 'خطأ',
            description: 'فشل في تطبيق الفلتر',
            imageUrl: 'assets/logo_elbatt.png',
            soundUrl: 'assets/sound/duck.mp3',
            autoCloseMs: 2000,
          });
        },
      });
  }
  // ==================================== toggel filter  function  ====================================
  toggelFilters() {
    this.showFilters = !this.showFilters;
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onPageChange(e: PageEvent) {
    this.page$.next({ index: e.pageIndex, size: e.pageSize });
    // Fetch new page from server
    this.applyFilters();
  }

  onSortChange(e: Sort) {
    this.sort$.next({ field: e.active || '', dir: (e.direction as any) || '' });
    this.page$.next({ index: 0, size: this.page$.value.size });
    // Fetch sorted data
    this.applyFilters();
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
    this.applyFilters();
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
          : (Number(f.mode) as 0 | 1 | 2),
      CreatedAt: (f.createdAt || '').trim() || undefined,
    };
  }

  // assign to company
  isAllSelected(): boolean {
    const numSelected = this.selectedRows.size;
    const numRows = this.clients.length;
    return numRows > 0 && numSelected === numRows;
  }

  selectAllRows(event: any): void {
    if (event.checked) {
      this.selectedRows = new Set<number>(
        this.clients.map((r: any) => (r as any).id)
      );
      this.clients.forEach((r: any) => (this.isSelected[(r as any).id] = true));
    } else {
      this.selectedRows.clear();
      this.isSelected = {};
    }
  }

  onSelectionChange(row: any): void {
    const id = (row as any).id; // غيّر لو اسم المعرف مختلف
    const checked = !!this.isSelected[id];
    if (checked) this.selectedRows.add(id);
    else this.selectedRows.delete(id);
  }

  isSomeSelected(): boolean {
    const numSelected = this.selectedRows.size;
    const numRows = this.clients.length;
    return numSelected > 0 && numSelected < numRows;
  }
  // ============================================ dialog add leads =========================================
  openDialog(dept?: IDepartments): void {
    const isEdit = !!dept;
    const dialogRef = this.dialog.open(FormDialogComponent, {
      width: '877px',
      height: '693px',
      panelClass: 'form-dialog--employee',
      data: {
        title: isEdit ? 'Edit Department' : 'Add Department',
        fields: [
          { name: 'name', label: 'القسم', type: 'text', required: true },
          { name: 'name', label: 'القسم', type: 'text', required: true },
          { name: 'name', label: 'القسم', type: 'text', required: true },
          { name: 'name', label: 'القسم', type: 'text', required: true },
          { name: 'name', label: 'القسم', type: 'text', required: true },
          { name: 'name', label: 'القسم', type: 'text', required: true },
          { name: 'name', label: 'القسم', type: 'text', required: true },
          { name: 'name', label: 'القسم', type: 'text', required: true },
        ],
        initialData: dept || {},
      },
    });

    // Handle dialog result (save changes)
    // dialogRef.afterClosed().subscribe((result) => {
    //   if (!result) return;

    //   const req$ =
    //     isEdit && dept?.id
    //       ? this.DepartmentsService.update(dept.id, result)
    //       : this.DepartmentsService.add(result);

    //   req$.subscribe(() => {
    //     //Show success dialog with dynamic title
    //     this.notify.success({
    //       title: isEdit ? 'تعديل ناجح' : 'نجاح',
    //       description: isEdit ? 'تم تعديل القسم بنجاح' : 'تم اضافة القسم بنجاح',
    //     });
    //     this.fetch();
    //   });
    // });
  }

  /**
   * Triggered when clicking the Edit action.
   */
  // onEditDepartment(dept: IDepartments) {
  //   this.openDialog(dept);
  // }

  /**
   * Opens confirmation dialog for deleting a department.
   */
  // onDeleteDepartment(dept?: IDepartments): void {
  //   if (!dept?.id) {
  //     this.toastr.error('Invalid department ID');
  //     return;
  //   }

  //   const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
  //     width: '420px',
  //     data: { title: 'Department', message: 'department' },
  //   });

  //   // Handle delete confirmation
  //   dialogRef.afterClosed().subscribe((ok) => {
  //     if (!ok) return;
  //     this.departmentsService.delete(dept.id!).subscribe(() => {
  //       // this.toastr.error('Department deleted');
  //       this.notify.error({
  //         title: 'نجاح',
  //       });
  //       this.fetch();
  //     });
  //   });
  // }
}
