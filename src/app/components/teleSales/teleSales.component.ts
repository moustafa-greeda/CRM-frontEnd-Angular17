import { Component } from '@angular/core';
import { TeleSalesService } from './tele-sales.service';
import { forkJoin } from 'rxjs';
import {
  ITransferredLead,
  ITransferredLeadsData,
} from '../../core/Models/teleSalse/itransferred-leads-to-sales';

interface TopSalesperson {
  id: number;
  name: string;
  profileImage: string;
  totalSales: number;
  totalDeals: number;
  rank: number;
}

@Component({
  selector: 'app-sales',
  templateUrl: './teleSales.component.html',
  styleUrls: ['./teleSales.component.css', '../sales/sales.component.css'],
})
export class TeleSalesComponent {
  constructor(private _teleSalesService: TeleSalesService) {}
  pageTitle = 'لوحة تحكم ال TeleSalse';
  breadcrumb = [
    { label: 'الرئيسية', path: '/dashboard/admin' },
    {
      label: 'نظرة شاملة على أداء فريق المكالمات',
      path: '/dashboard/admin/telesales',
    },
  ];
  stats: any[] = [];
  totalCalls: number = 0;
  closedLeads: number = 0;
  TotalSales: number = 0;
  AverageCallDuration: number = 0;
  transferredLeadsData: ITransferredLeadsData | null = null;
  transferredLeads: ITransferredLead[] = [];
  transferredLeadsColumns: {
    key: string;
    header: string;
    width?: string;
    formatter?: 'date' | 'datetime';
  }[] = [
    { key: 'employeeName', header: 'موظف الاتصال' },
    { key: 'leadName', header: 'اسم العميل' },
    { key: 'leadStatus', header: 'حالة العميل' },
    { key: 'assignedBy', header: 'موظف التحويل' },
    { key: 'assignedAt', header: 'تاريخ التحويل', formatter: 'datetime' },
  ];
  ngOnInit(): void {
    forkJoin({
      totalCalls: this._teleSalesService.GetAllCallCount(),
      totalInterstedLeads: this._teleSalesService.GetTotalInterstedLeads(),
      conversionRate: this._teleSalesService.conversionRate(),
      AverageCallDuration: this._teleSalesService.AverageCallDuration(),
      GetAvregCallCounts: this._teleSalesService.GetAvregCallCounts(),
      TotalRejectedLeads: this._teleSalesService.totalRejected(),
      TotalRescheduledCalls: this._teleSalesService.TotalRescheduledCalls(),
      GetTotalCallWithNoAnswer:
        this._teleSalesService.GetTotalCallWithNoAnswer(),
    }).subscribe({
      next: (res) => {
        this.stats = [
          {
            title: 'إجمالي المكالمات',
            count: res.totalCalls?.data?.totalCalls || 0,
            imageSrc: './assets/img/teleSalse-admin/call.svg',
          },
          {
            title: 'العملاء المهتمين ',
            count: res.totalInterstedLeads?.data?.totalInterestedLeads,
            imageSrc: './assets/img/teleSalse-admin/blue-user.svg',
          },
          {
            title: 'نسبة التحويل للمبيعات',
            count: res.conversionRate?.data?.conversionRate || 0,
            imageSrc: './assets/img/teleSalse-admin/arrow.svg',
          },
          {
            title: 'متوسط مدة المكالمة',
            count: res.AverageCallDuration?.data?.averageCallDuration || 0,
            imageSrc: './assets/img/teleSalse-admin/watch.svg',
          },
          {
            title: 'معدل المكالمات/موظف',
            count: res.GetAvregCallCounts?.data?.averageCallsPerDirection || 0,
            imageSrc: './assets/img/teleSalse-admin/avarge.svg',
          },
          {
            title: 'عملاء رافضين',
            count: res.TotalRejectedLeads?.data?.totalRejected,
            imageSrc: './assets/img/teleSalse-admin/chracter-user.svg',
          },
          {
            title: 'إعادة جدولة',
            count: res.TotalRescheduledCalls?.data?.totalRescheduled,
            imageSrc: './assets/img/teleSalse-admin/date.svg',
          },
          {
            title: 'لم يتم الرد',
            count: res.GetTotalCallWithNoAnswer?.data?.totalCalls,
            imageSrc: './assets/img/teleSalse-admin/chracter-user.svg',
          },
        ];
      },
    });

    // ==================================== GetTransferredLeadsToSales ============================
    this.GetTransferredLeadsToSales();
  }
  // ==================================== GetTransferredLeadsToSales ============================
  GetTransferredLeadsToSales(): void {
    this._teleSalesService.GetTransferredLeadsToSales().subscribe({
      next: (res) => {
        this.transferredLeads = res.data.transferredLeads;
      },
    });
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
