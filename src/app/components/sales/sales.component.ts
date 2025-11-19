import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { SalesService } from './sales.service';

interface TopSalesperson {
  id: number;
  name: string;
  profileImage: string;
  totalSales: number;
  totalDeals: number;
  rank: number;
}

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

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css',
})
export class SalesComponent implements OnInit {
  constructor(private _salesService: SalesService) {}
  pageTitle = 'ادارة المبيعات';
  breadcrumb = [
    { label: 'الرئيسية', path: '/dashboard/admin' },
    { label: 'المبيعات', path: '/dashboard/admin/sales' },
  ];
  stats: any[] = [];
  earnByCurrency: CurrencyEarning[] = [];

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    forkJoin({
      GetExpectedLeads: this._salesService.GetExpectedLeads(),
      GetConvertedLeads: this._salesService.GetConvertedLeads(),
      GetTotalEarnSum: this._salesService.GetTotalEarnSum(),
      GetAvreageDealMoney: this._salesService.GetAvreageDealMoney(),
    }).subscribe({
      next: (res) => {
        const totalEarnSummary = res.GetTotalEarnSum?.data;
        const confirmedLeads = res.GetConvertedLeads.data?.confirmedLeads || 0;
        const totalEarn = totalEarnSummary?.totalEarnAllCurrencies || 0;
        const budgetByCurrency: BudgetByCurrency[] =
          res.GetAvreageDealMoney?.data?.budgetByCurrency ?? [];
        const averageDealValue =
          this.calculateOverallAverageDeal(budgetByCurrency);

        this.stats = [
          {
            title: 'إجمالي العملاء المتوقعين',
            count: res.GetExpectedLeads.data?.expectedLeads || 0,
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

        this.earnByCurrency = totalEarnSummary?.earnByCurrency ?? [];
      },
    });
  }

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

  topSalespeople: TopSalesperson[] = [
    {
      id: 1,
      name: 'مريم محمد',
      profileImage: './assets/img/avatar-male.svg',
      totalSales: 225000,
      totalDeals: 45,
      rank: 1,
    },
    {
      id: 2,
      name: 'سارة حسن',
      profileImage: './assets/img/avatar-male.svg',
      totalSales: 190000,
      totalDeals: 38,
      rank: 2,
    },
    {
      id: 3,
      name: 'محمود حسن',
      profileImage: './assets/img/avatar-male.svg',
      totalSales: 175000,
      totalDeals: 35,
      rank: 3,
    },
  ];

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
