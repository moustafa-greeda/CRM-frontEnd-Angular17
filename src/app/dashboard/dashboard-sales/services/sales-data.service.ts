import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DashboardSalseService } from '../dashboard-salse.service';
import { LeadStatusService } from '../../../core/services/common/lead-status.service';
import { CountryCityService } from '../../../core/services/common/country-city.service';
import { ICountry } from '../../../core/Models/common/icountry';
import { ICity } from '../../../core/Models/common/country-city.models';
import { SalesStats } from '../models/sales.types';

@Injectable({
  providedIn: 'root',
})
export class SalesDataService {
  private readonly dashboardService = inject(DashboardSalseService);
  private readonly leadStatusService = inject(LeadStatusService);
  private readonly countryCityService = inject(CountryCityService);

  loadDashboardStats(): Observable<SalesStats[]> {
    return forkJoin({
      totalLeadsAssignments: this.dashboardService
        .LeadAssignmentsCountSales()
        .pipe(catchError(() => of({ data: { count: 0 } }))),
      closedLeads: this.dashboardService
        .GetMyClosedLeads()
        .pipe(catchError(() => of({ data: { closedLeadsCount: 0 } }))),
      TotalMoney: this.dashboardService
        .GetTotalMoney()
        .pipe(catchError(() => of({ data: { budgets: [] } }))),
      AverageCallDuration: this.dashboardService
        .GetWaitingForFollowUp()
        .pipe(catchError(() => of({ data: { leadAssignmentsCount: 0 } }))),
    }).pipe(
      map((res) => {
        const budgets = Array.isArray(res.TotalMoney?.data?.budgets)
          ? (res.TotalMoney.data.budgets as Array<{
              totalBudget: number;
              currency: string;
            }>)
          : [];
        const totalBudget = budgets.reduce(
          (acc: number, budget: { totalBudget: number }) =>
            acc + budget.totalBudget,
          0
        );

        const budgetDetails = budgets
          .map((budget) => `${budget.totalBudget} ${budget.currency}`)
          .join(' , ');

        return [
          {
            title: 'اجمالي العملاء',
            count: res.totalLeadsAssignments?.data?.count ?? 0,
            icon: 'bi bi-person-lines-fill',
          },
          {
            title: 'الصفقات المغلقة',
            count: res.closedLeads?.data?.closedLeadsCount ?? 0,
            icon: 'bi bi-exclamation-triangle',
          },
          {
            title: 'القيمة الإجمالية',
            count: `${budgetDetails} | الإجمالي: ${totalBudget}`,
            icon: 'bi bi-cash-coin',
          },
          {
            title: 'في انتظار المتابعة',
            count: res.AverageCallDuration?.data?.leadAssignmentsCount ?? 0,
            icon: 'bi bi-bar-chart',
          },
        ];
      })
    );
  }

  loadLeadStatuses(): Observable<{ names: string[]; map: Map<string, number> }> {
    return this.leadStatusService.getAllLeadStatus().pipe(
      map((response) => {
        const names = response.data.map((status) => status.name);
        const statusMap = new Map<string, number>();
        response.data.forEach((status) => {
          statusMap.set(status.name, status.id!);
        });
        return { names, map: statusMap };
      }),
      catchError(() => of({ names: [], map: new Map() }))
    );
  }

  loadCountries(): Observable<ICountry[]> {
    return this.countryCityService.getAllCountries().pipe(
      map((response) => (response.succeeded ? response.data : [])),
      catchError(() => of([]))
    );
  }

  loadCitiesByCountryId(countryId: number): Observable<ICity[]> {
    return this.countryCityService.getCitiesByCountryId(countryId).pipe(
      map((response) => (response.succeeded ? response.data : [])),
      catchError(() => of([]))
    );
  }

  loadSalesActions(
    employeeId: number,
    startDate?: string,
    endDate?: string
  ): Observable<any> {
    return this.dashboardService.getSalesActions(
      employeeId,
      startDate,
      undefined,
      endDate
    );
  }

  loadRecentInteractions(): Observable<any[]> {
    return this.dashboardService.getRecentInteractions().pipe(
      map((response) => (response.succeeded ? response.data : [])),
      catchError(() => of([]))
    );
  }

  loadNotifications(): Observable<any[]> {
    return this.dashboardService.getNotifications().pipe(
      map((response) =>
        response.succeeded ? response.data.items : []
      ),
      catchError(() => of([]))
    );
  }
}
