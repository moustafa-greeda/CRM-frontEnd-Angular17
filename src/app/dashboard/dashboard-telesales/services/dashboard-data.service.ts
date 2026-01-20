import { Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DashboardTeleService } from '../dashboard.service';
import { LeadStatusService } from '../../../core/services/common/lead-status.service';
import { CallStatusService } from '../../../core/services/common/call-status.service';
import { CountryCityService } from '../../../core/services/common/country-city.service';
import { GetAllSalesService } from '../../../core/services/common/get-all-sales.service';
import { CurruncyService } from '../../../core/services/common/curruncy.service';
import { ICallStatus } from '../../../core/Models/common/call-status';
import { ICountry } from '../../../core/Models/common/icountry';
import { ICity } from '../../../core/Models/common/country-city.models';

/**
 * Service to manage dashboard data loading and state
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardDataService {
  private readonly dashboardService = inject(DashboardTeleService);
  private readonly leadStatusService = inject(LeadStatusService);
  private readonly callStatusService = inject(CallStatusService);
  private readonly countryCityService = inject(CountryCityService);
  private readonly salesService = inject(GetAllSalesService);
  private readonly currencyService = inject(CurruncyService);

  // State signals
  readonly stats = signal<any[]>([]);
  readonly listLeadStatus = signal<string[]>([]);
  readonly leadStatusMap = signal<Map<string, number>>(new Map());
  readonly leadStatusOptions = signal<string[]>([]);
  readonly salesList = signal<any[]>([]);
  readonly currencyList = signal<any[]>([]);
  readonly callStatusList = signal<ICallStatus[]>([]);
  readonly countryList = signal<ICountry[]>([]);
  readonly cityList = signal<ICity[]>([]);

  /**
   * Load dashboard statistics
   */
  loadDashboardStats(destroyRef: any): void {
    forkJoin({
      totalCalls: this.dashboardService.getCallCountTele(),
      closedLeads: this.dashboardService.GetMyClosedLeads(),
      TotalSales: this.dashboardService.GettelesalesTotalLeadCount(),
      AverageCallDuration: this.dashboardService.GetAverageCallDurationThisMonth(),
    })
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe({
        next: (res) => {
          this.stats.set([
            {
              title: 'Total Calls This Month',
              count: res.totalCalls?.data?.totalLeadsAssignedThisMonth || 0,
              icon: 'bi-telephone',
            },
            {
              title: 'Total closed leads this month',
              count: res.closedLeads?.data?.closedLeadsThisMonth || 0,
              icon: 'bi bi-exclamation-triangle',
            },
            {
              title: 'Total Clients',
              count: res.TotalSales?.data?.count || 0,
              icon: 'bi-person-fill-add',
            },
            {
              title: 'Avarage call distribution this month',
              count: res.AverageCallDuration?.data?.averageCallDuration || 0,
              icon: 'bi bi-bar-chart',
            },
          ]);
        },
        error: () => {
          this.setDefaultStats();
        },
      });
  }

  /**
   * Load lead statuses
   */
  loadLeadStatuses(destroyRef: any): void {
    this.leadStatusService
      .getAllLeadStatus()
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe({
        next: (response) => {
          this.listLeadStatus.set(response.data.map((status) => status.name));
          this.leadStatusOptions.set(response.data.map((status) => status.name));

          const map = new Map<string, number>();
          response.data.forEach((status) => {
            map.set(status.name, status.id!);
          });
          this.leadStatusMap.set(map);
        },
        error: () => {
          // Handle error silently
        },
      });
  }

  /**
   * Load call statuses
   */
  loadCallStatuses(destroyRef: any): void {
    this.callStatusService
      .getAllCallStatus()
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe({
        next: (response) => {
          if (response.succeeded && response.data) {
            this.callStatusList.set(
              response.data.map(
                (item: any): ICallStatus => ({
                  id: item.id,
                  status: item.status,
                })
              )
            );
          } else {
            this.callStatusList.set([]);
          }
        },
        error: () => {
          this.callStatusList.set([]);
        },
      });
  }

  /**
   * Load countries
   */
  loadCountries(destroyRef: any): void {
    this.countryCityService
      .getAllCountries()
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.countryList.set(response.data);
          }
        },
        error: () => {
          this.countryList.set([]);
        },
      });
  }

  /**
   * Load cities by country ID
   */
  loadCitiesByCountry(countryId: number, destroyRef: any): void {
    this.countryCityService
      .getCitiesByCountryId(countryId)
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe({
        next: (response) => {
          if (response.succeeded) {
            this.cityList.set(response.data);
          }
        },
        error: () => {
          this.cityList.set([]);
        },
      });
  }

  /**
   * Load sales list
   */
  loadSalesList(destroyRef: any): void {
    this.salesService
      .getAllSales()
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe({
        next: (response) => {
          this.salesList.set(response.data);
        },
      });
  }

  /**
   * Load currency list
   */
  loadCurrencyList(destroyRef: any): void {
    this.currencyService
      .getCurruncy()
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe({
        next: (response) => {
          this.currencyList.set(response.data);
        },
      });
  }

  /**
   * Set default stats when loading fails
   */
  private setDefaultStats(): void {
    this.stats.set([
      {
        title: 'Total Calls This Month',
        count: 0,
        icon: 'bi-telephone',
      },
      {
        title: 'Total closed leads this month',
        count: 0,
        icon: 'bi bi-exclamation-triangle',
      },
      {
        title: 'Total Clients',
        count: 0,
        icon: 'bi-person-fill-add',
      },
      {
        title: 'Avarage call distribution this month',
        count: 0,
        icon: 'bi bi-bar-chart',
      },
    ]);
  }

  /**
   * ✅ Observable versions for parallel loading with forkJoin
   */
  loadDashboardStatsObservable(): Observable<void> {
    return forkJoin({
      totalCalls: this.dashboardService.getCallCountTele(),
      closedLeads: this.dashboardService.GetMyClosedLeads(),
      TotalSales: this.dashboardService.GettelesalesTotalLeadCount(),
      AverageCallDuration: this.dashboardService.GetAverageCallDurationThisMonth(),
    }).pipe(
      map((res) => {
        this.stats.set([
          {
            title: 'Total Calls This Month',
            count: res.totalCalls?.data?.totalLeadsAssignedThisMonth || 0,
            icon: 'bi-telephone',
          },
          {
            title: 'Total closed leads this month',
            count: res.closedLeads?.data?.closedLeadsThisMonth || 0,
            icon: 'bi bi-exclamation-triangle',
          },
          {
            title: 'Total Clients',
            count: res.TotalSales?.data?.count || 0,
            icon: 'bi-person-fill-add',
          },
          {
            title: 'Avarage call distribution this month',
            count: res.AverageCallDuration?.data?.averageCallDuration || 0,
            icon: 'bi bi-bar-chart',
          },
        ]);
      }),
      catchError(() => {
        this.setDefaultStats();
        return of(void 0);
      })
    );
  }

  loadLeadStatusesObservable(): Observable<void> {
    return this.leadStatusService.getAllLeadStatus().pipe(
      map((response) => {
        this.listLeadStatus.set(response.data.map((status) => status.name));
        this.leadStatusOptions.set(response.data.map((status) => status.name));

        const map = new Map<string, number>();
        response.data.forEach((status) => {
          map.set(status.name, status.id!);
        });
        this.leadStatusMap.set(map);
      }),
      catchError(() => of(void 0))
    );
  }

  loadCallStatusesObservable(): Observable<void> {
    return this.callStatusService.getAllCallStatus().pipe(
      map((response) => {
        if (response.succeeded && response.data) {
          this.callStatusList.set(
            response.data.map(
              (item: any): ICallStatus => ({
                id: item.id,
                status: item.status,
              })
            )
          );
        } else {
          this.callStatusList.set([]);
        }
      }),
      catchError(() => {
        this.callStatusList.set([]);
        return of(void 0);
      })
    );
  }

  loadCountriesObservable(): Observable<void> {
    return this.countryCityService.getAllCountries().pipe(
      map((response) => {
        if (response.succeeded) {
          this.countryList.set(response.data);
        }
      }),
      catchError(() => {
        this.countryList.set([]);
        return of(void 0);
      })
    );
  }

  loadSalesListObservable(): Observable<void> {
    return this.salesService.getAllSales().pipe(
      map((response) => {
        this.salesList.set(response.data);
      }),
      catchError(() => of(void 0))
    );
  }

  loadCurrencyListObservable(): Observable<void> {
    return this.currencyService.getCurruncy().pipe(
      map((response) => {
        this.currencyList.set(response.data);
      }),
      catchError(() => of(void 0))
    );
  }
}
