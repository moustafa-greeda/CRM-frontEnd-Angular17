import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  computed,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, throwError, timer } from 'rxjs';
import {
  timeout,
  retry,
  catchError,
  retryWhen,
  delayWhen,
  take,
  mergeMap,
} from 'rxjs/operators';
import { SalesService } from './sales.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CountCardComponent } from '../../shared/components/count-card/count-card.component';
import { NoResultsMessageComponent } from '../../shared/components/no-results-message/no-results-message.component';
import { ChartsSalesComponent } from './first-charts/first-charts.component';

interface CurrencyEarning {
  currencyId: number;
  currencyName: string;
  totalEarn: number;
}

interface BudgetByCurrency {
  currencyId: number;
  currencyName: string;
  totalBudget: number;
  totalLeads: number;
  averageBudget: number;
}

interface ITop3Sales {
  salesName: string;
  totalLeads: number;
  totalBudget: number;
  profileImage?: string;
}

interface StatCard {
  title: string;
  count: number;
  imageSrc: string;
  subtitle?: string;
}

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    CountCardComponent,
    NoResultsMessageComponent,
    ChartsSalesComponent,
  ],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesComponent implements OnInit {
  // ========== UI Configuration ==========
  readonly pageTitle = 'ادارة المبيعات';
  readonly breadcrumb = [
    { label: 'الرئيسية', path: '/dashboard/admin' },
    { label: 'المبيعات', path: '/dashboard/admin/sales' },
  ];

  // ========== State Signals ==========
  readonly stats = signal<StatCard[]>([]);
  readonly topSalespeople = signal<ITop3Sales[]>([]);
  readonly earnByCurrency = signal<CurrencyEarning[]>([]);
  readonly isLoading = signal<boolean>(false);
  private readonly destroyRef = inject(DestroyRef);

  constructor(private salesService: SalesService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  // ========== Data Loading Methods ==========
  private loadAllData(): void {
    this.isLoading.set(true);

    // Helper function to add timeout and retry to requests
    const withTimeoutAndRetry = <T>(obs: any, timeoutMs: number = 30000) => {
      return obs.pipe(
        timeout(timeoutMs),
        retryWhen((errors) =>
          errors.pipe(
            mergeMap((error, index) => {
              // Retry up to 2 times with exponential backoff
              if (index < 2) {
                const delay = Math.min(1000 * Math.pow(2, index), 4000);
                return timer(delay);
              }
              return throwError(() => error);
            })
          )
        ),
        catchError((error) => {
          console.error('API request failed after retries:', error);
          // Return empty/default data instead of throwing
          return throwError(() => error);
        })
      );
    };

    forkJoin({
      GetExpectedLeads: withTimeoutAndRetry(
        this.salesService.GetExpectedLeads()
      ),
      GetConvertedLeads: withTimeoutAndRetry(
        this.salesService.GetConvertedLeads(),
      ),
      GetTotalEarnSum: withTimeoutAndRetry(
        this.salesService.GetTotalEarnSum(),
    
      ),
      GetAvreageDealMoney: withTimeoutAndRetry(
        this.salesService.GetAvreageDealMoney(),

      ),
      GetTop3Sales: withTimeoutAndRetry(
        this.salesService.GetTop3Sales(),
       
      ),
    } as any)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (res: any) => {
        const totalEarnSummary = res.GetTotalEarnSum?.data;
        const confirmedLeads = res.GetConvertedLeads?.data?.confirmedLeads || 0;
        const totalEarn = totalEarnSummary?.totalEarnAllCurrencies || 0;
        const budgetByCurrency: BudgetByCurrency[] =
          res.GetAvreageDealMoney?.data?.budgetByCurrency ?? [];
        const averageDealValue =
          this.calculateOverallAverageDeal(budgetByCurrency);

        const newStats: StatCard[] = [
          {
            title: 'إجمالي العملاء المتوقعين',
            count: res.GetExpectedLeads?.data?.expectedLeads || 0,
            imageSrc: './assets/img/clup.svg',
          },
          {
            title: 'نسبة التحويل',
            count: confirmedLeads,
            imageSrc: './assets/img/precentage.svg',
          },
          {
            title: 'إجمالي الإيرادات',
            count: totalEarn,
            subtitle: this.buildCurrencySubtitle(
              totalEarn,
              totalEarnSummary?.earnByCurrency
            ),
            imageSrc: './assets/img/jellwary.svg',
          },
          {
            title: 'متوسط قيمة الصفقة  ',
            count: averageDealValue,
            subtitle: this.buildBudgetSubtitle(budgetByCurrency),
            imageSrc: './assets/img/dolar.svg',
          },
        ];

        this.stats.set(newStats);
        this.earnByCurrency.set(totalEarnSummary?.earnByCurrency ?? []);
        this.topSalespeople.set(res.GetTop3Sales?.data ?? []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading sales data:', error);
        // Set default/empty data on error
        this.stats.set([]);
        this.topSalespeople.set([]);
        this.isLoading.set(false);
      },
    });
  }

  // ========== Helper Methods ==========
  private buildCurrencySubtitle(
    totalEarn: number,
    earnings?: CurrencyEarning[]
  ): string | undefined {
    const parts: string[] = [];

    if (typeof totalEarn === 'number') {
      parts.push(`الإجمالي: ${this.formatNumber(totalEarn)}`);
    }

    earnings?.forEach((currency) => {
      parts.push(
        `${currency.currencyName}: ${this.formatNumber(currency.totalEarn)}`
      );
    });

    return parts.length ? parts.join(' | ') : undefined;
  }

  private buildBudgetSubtitle(
    budgets?: BudgetByCurrency[]
  ): string | undefined {
    if (!budgets || budgets.length === 0) {
      return undefined;
    }

    return budgets
      .map(
        (item) =>
          `${item.currencyName}: ${this.formatNumber(item.averageBudget)} (من ${
            item.totalLeads
          } عملاء)`
      )
      .join(' | ');
  }

  private calculateOverallAverageDeal(budgets: BudgetByCurrency[]): number {
    if (!budgets.length) {
      return 0;
    }

    const totalBudget = budgets.reduce(
      (sum, item) => sum + (item.totalBudget || 0),
      0
    );
    const totalLeads = budgets.reduce(
      (sum, item) => sum + (item.totalLeads || 0),
      0
    );

    if (!totalLeads) {
      return 0;
    }

    return Math.round(totalBudget / totalLeads);
  }

  private formatNumber(value?: number): string {
    return new Intl.NumberFormat('ar-SA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value ?? 0);
  }

  // ========== Template Helper Methods ==========
  getMedalIcon(rank: number): string {
    switch (rank) {
      case 1:
        return './assets/img/first.svg';
      case 2:
        return './assets/img/second.svg';
      case 3:
        return './assets/img/third.svg';
      default:
        return '';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
