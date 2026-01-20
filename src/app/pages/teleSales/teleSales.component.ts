import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  DestroyRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TeleSalesService } from './tele-sales.service';
import { forkJoin } from 'rxjs';
import {
  ITransferredLead,
  ITransferredLeadsData,
} from '../../core/Models/teleSalse/itransferred-leads-to-sales';
import { ITop3TeleSales } from '../../core/Models/teleSalse/ITop3TeleSales';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { CountCardComponent } from '../../shared/components/count-card/count-card.component';
import { TableComponent } from '../../shared/components/table/table.component';
import { NoResultsMessageComponent } from '../../shared/components/no-results-message/no-results-message.component';
import { ChartsTeleSalesComponent } from './chart/first-charts.component';

interface StatCard {
  title: string;
  count: number;
  imageSrc: string;
}

interface TableColumn {
  key: string;
  header: string;
  width?: string;
  formatter?: 'date' | 'datetime';
}

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageHeaderComponent,
    CountCardComponent,
    TableComponent,
    NoResultsMessageComponent,
    ChartsTeleSalesComponent,
  ],
  templateUrl: './teleSales.component.html',
  styleUrls: ['./teleSales.component.css', '../sales/sales.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeleSalesComponent implements OnInit {
  // ========== UI Configuration ==========
  readonly pageTitle = 'لوحة تحكم ال TeleSalse';
  readonly breadcrumb = [
    { label: 'الرئيسية', path: '/dashboard/admin' },
    {
      label: 'نظرة شاملة على أداء فريق المكالمات',
      path: '/dashboard/admin/telesales',
    },
  ];

  readonly transferredLeadsColumns: TableColumn[] = [
    { key: 'employeeName', header: 'موظف الاتصال' },
    { key: 'leadName', header: 'اسم العميل' },
    { key: 'leadStatus', header: 'حالة العميل' },
    { key: 'assignedBy', header: 'موظف التحويل' },
    { key: 'assignedAt', header: 'تاريخ التحويل', formatter: 'datetime' },
  ];

  // ========== State Signals ==========
  readonly stats = signal<StatCard[]>([]);
  readonly transferredLeads = signal<ITransferredLead[]>([]);
  readonly topTeleSales = signal<ITop3TeleSales[]>([]);
  readonly isLoading = signal<boolean>(false);

  private readonly destroyRef = inject(DestroyRef);

  constructor(private teleSalesService: TeleSalesService) {}
  ngOnInit(): void {
    this.loadAllData();
  }

  // ========== Data Loading Methods ==========
  private loadAllData(): void {
    this.isLoading.set(true);
    forkJoin({
      stats: forkJoin({
        totalCalls: this.teleSalesService.GetAllCallCount(),        
        totalInterstedLeads: this.teleSalesService.GetTotalInterstedLeads(),
        conversionRate: this.teleSalesService.conversionRate(),
        AverageCallDuration: this.teleSalesService.AverageCallDuration(),
        GetAvregCallCounts: this.teleSalesService.GetAvregCallCounts(),
        TotalRejectedLeads: this.teleSalesService.totalRejected(),
        TotalRescheduledCalls: this.teleSalesService.TotalRescheduledCalls(),
        GetTotalCallWithNoAnswer:
          this.teleSalesService.GetTotalCallWithNoAnswer(),
      }),
      transferredLeads: this.teleSalesService.GetTransferredLeadsToSales(),
      topTeleSales: this.teleSalesService.GetTop3TeleSales(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (res) => {
        // Set stats
        const statsRes = res.stats;
        this.stats.set([
          {
            title: 'إجمالي المكالمات',
            count: statsRes.totalCalls?.data?.totalCalls || 0,
            imageSrc: './assets/img/teleSalse-admin/call.svg',
          },
          {
            title: 'العملاء المهتمين ',
            count:
              statsRes.totalInterstedLeads?.data?.totalInterestedLeads || 0,
            imageSrc: './assets/img/teleSalse-admin/blue-user.svg',
          },
          {
            title: 'نسبة التحويل للمبيعات',
            count: statsRes.conversionRate?.data?.conversionRate || 0,
            imageSrc: './assets/img/teleSalse-admin/arrow.svg',
          },
          {
            title: 'متوسط مدة المكالمة',
            count: statsRes.AverageCallDuration?.data?.averageCallDuration || 0,
            imageSrc: './assets/img/teleSalse-admin/watch.svg',
          },
          {
            title: 'معدل المكالمات/موظف',
            count:
              statsRes.GetAvregCallCounts?.data?.averageCallsPerDirection || 0,
            imageSrc: './assets/img/teleSalse-admin/avarge.svg',
          },
          {
            title: 'عملاء رافضين',
            count: statsRes.TotalRejectedLeads?.data?.totalRejected || 0,
            imageSrc: './assets/img/teleSalse-admin/chracter-user.svg',
          },
          {
            title: 'إعادة جدولة',
            count: statsRes.TotalRescheduledCalls?.data?.totalRescheduled || 0,
            imageSrc: './assets/img/teleSalse-admin/date.svg',
          },
          {
            title: 'لم يتم الرد',
            count: statsRes.GetTotalCallWithNoAnswer?.data?.totalCalls || 0,
            imageSrc: './assets/img/teleSalse-admin/chracter-user.svg',
          },
        ]);

        // Set transferred leads
        this.transferredLeads.set(
          res.transferredLeads?.data?.transferredLeads || []
        );

        // Set top tele sales
        this.topTeleSales.set(res.topTeleSales?.data || []);

        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
  // ========== Helper Methods ==========
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

  onProfileImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Fallback to default avatar if profile image fails to load
    if (img.src && !img.src.includes('avatar-male.svg') && !img.src.includes('avatar-female.svg')) {
      img.src = './assets/img/avatar-male.svg';
    }
  }
}
