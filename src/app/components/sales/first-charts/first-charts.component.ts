import { Component, OnInit } from '@angular/core';
import { MainChartService } from './main-chart.service';
import {
  ICompanyStageChart,
  IJobTitleChart,
  IrevenueChart,
  ITopIndustrychart,
} from '../../../core/Models/main-chart/ichart';

@Component({
  selector: 'app-sales-charts',
  templateUrl: './first-charts.component.html',
  styleUrls: ['./first-charts.component.css'],
})
export class ChartsSalesComponent implements OnInit {
  constructor(private _ChartService: MainChartService) {}

  // Conversion Funnel (مسار التحويل) - Top Right
  conversionFunnelData: ITopIndustrychart[] = [];
  conversionFunnelChartOption: any = {};

  // Revenue Trend (اتجاه الإيرادات) - Top Left
  revenueTrendData: IrevenueChart[] = [];
  revenueTrendChartOption: any = {};
  revenueTrendMonthLabel: string | null = null;

  // Weekly Performance (الأداء الأسبوعي) - Bottom Right
  weeklyPerformanceData: IJobTitleChart[] = [];
  weeklyPerformanceChartOptions: any = {};

  // leadStatus (حالة العميل) - Bottom Left
  leadStatusData: ICompanyStageChart[] = [];
  leadStatusChartOption: any = {};

  ngOnInit(): void {
    // =======================================  Conversion Funnel (مسار التحويل) ====================
    this.conversionFunnelData = [
      { industry: 'Industry 1', persntage: 50 },
      { industry: 'Industry 2', persntage: 30 },
      { industry: 'Industry 3', persntage: 20 },
    ];
    this.updateConversionFunnelChart();

    // ====================================  Revenue Trend (اتجاه الإيرادات) ====================
    // Initialize with empty array, will be populated from API
    this.revenueTrendData = [];
    this.GetDailyRevenueChart();

    // ================================  Weekly Performance (الأداء الأسبوعي) ============================
    this.weeklyPerformanceData = [
      { jobTitle: 'السبت', jobTitleCount: 19, converted: 14 } as IJobTitleChart,
      { jobTitle: 'الأحد', jobTitleCount: 21, converted: 15 } as IJobTitleChart,
      {
        jobTitle: 'الإثنين',
        jobTitleCount: 22,
        converted: 17,
      } as IJobTitleChart,
      {
        jobTitle: 'الثلاثاء',
        jobTitleCount: 8,
        converted: 12,
      } as IJobTitleChart,
      {
        jobTitle: 'الأربعاء',
        jobTitleCount: 20,
        converted: 15,
      } as IJobTitleChart,
      {
        jobTitle: 'الخميس',
        jobTitleCount: 20,
        converted: 17,
      } as IJobTitleChart,
      {
        jobTitle: 'الجمعة',
        jobTitleCount: 28,
        converted: 12,
      } as IJobTitleChart,
    ];
    this.updateWeeklyPerformanceChart();

    // ================================  Lead Status (حالة العميل) ====================================
    // Initialize with empty array, will be populated from API
    this.leadStatusData = [];
    this.GetLeadStatusPercentages();
  }

  // ===================================== Conversion Funnel Chart (مسار التحويل) ===============================
  private updateConversionFunnelChart(): void {
    // Calculate total count first
    const totalCount = this.conversionFunnelData.reduce(
      (sum, item) => sum + (item.persntage || 0),
      0
    );
    const colors = [
      '#FF5E00', // Orange
      '#FF7E33',
      '#FF9E66',
      '#FFBE99',
      '#FFDFCC',
      '#00687A', // blue
      '#33E0FF', //
      '#66E8FF', //
      '#99F0FF', //
      '#CCF7FF', //
    ];

    this.conversionFunnelChartOption = {
      animationEnabled: true,
      backgroundColor: 'transparent',
      title: {
        text: 'مسار التحويل (Funnel)',
        fontColor: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        padding: '5',
      },
      data: [
        {
          type: 'doughnut',
          indexLabelFontColor: '#FFF',
          indexLabelFontSize: 16,
          indexLabelLineThickness: 2,
          indexLabelPadding: 9,
          indexLabelLineColor: '#FFF',
          indexLabelPlacement: 'outside',
          dataPoints: this.conversionFunnelData.map((item, index) => ({
            label: item.industry + ' (' + item.persntage + '%)',
            y:
              totalCount > 0
                ? Math.round((item.persntage / totalCount) * 100 * 100) / 100
                : 0, // Convert to percentage
            color: colors[index % colors.length],
          })),
        },
      ],
    };
  }

  // =============================== Revenue Trend Chart (اتجاه الإيرادات) ==============================
  private GetDailyRevenueChart(): void {
    this._ChartService.GetDailyRevenueChart().subscribe({
      next: (response) => {
        if (response?.succeeded && response?.data) {
          const { days, values, start, monthName, monthLabel, month } =
            response.data;
          this.revenueTrendMonthLabel = start
            ? start.split('T')[0].slice(0, 7)
            : null;
          if (days && values && days.length === values.length) {
            this.revenueTrendData = days.map((day: string, index: number) => ({
              days: day, // days array → X-axis labels
              values: values[index] || 0, // values array → Y-axis values
            }));
          } else {
            // Fallback: keep empty array if data structure is invalid
            this.revenueTrendData = [];
          }
          this.updateRevenueTrendChart();
        } else {
          // Fallback: keep empty array if API fails
          this.updateRevenueTrendChart();
        }
      },
      error: (error) => {
        console.error('Failed to load daily revenue chart', error);
        // Fallback: keep empty array on error
        this.updateRevenueTrendChart();
      },
    });
  }

  private updateRevenueTrendChart(): void {
    // Calculate dynamic Y-axis maximum and interval based on data
    const maxValue =
      this.revenueTrendData.length > 0
        ? Math.max(...this.revenueTrendData.map((item) => item.values || 0))
        : 100;
    const calculatedMaximum = maxValue > 0 ? Math.ceil(maxValue * 1.2) : 100;
    const calculatedInterval =
      calculatedMaximum > 0 ? Math.ceil(calculatedMaximum / 6) : 20;

    const axisTitle = this.revenueTrendMonthLabel?.trim()?.length
      ? `الشهر (${this.revenueTrendMonthLabel})`
      : 'الشهر';

    this.revenueTrendChartOption = {
      animationEnabled: true,
      backgroundColor: 'transparent',
      title: {
        text: 'اتجاه الإيرادات',
        fontColor: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        padding: '5',
      },
      axisX: {
        title: axisTitle,
        titleFontColor: '#FFFFFF',
        titleFontSize: 14,
        titleFontFamily: 'Arial, sans-serif',
        titleFontWeight: 'bold',
        labelFontColor: '#FFFFFF',
        labelFontSize: 14,
        labelFontFamily: 'Arial, sans-serif',
        labelFontWeight: 'normal',
        gridThickness: 1,
        gridColor: 'rgba(255, 255, 255, 0.1)',
        lineThickness: 1,
        lineColor: 'rgba(255, 255, 255, 0.3)',
        tickThickness: 1,
        tickColor: 'rgba(255, 255, 255, 0.3)',
        interval: 1,
        labelAngle: 0,
        labelAutoFit: true,
        labelMaxWidth: 80,
        labelWrap: true,
      },
      axisY: {
        title: 'الإيرادات (رس)',
        titleFontColor: '#FFFFFF',
        titleFontSize: 14,
        titleFontFamily: 'Arial, sans-serif',
        titleFontWeight: 'bold',
        labelFontColor: '#FFFFFF',
        labelFontSize: 14,
        labelFontFamily: 'Arial, sans-serif',
        labelFontWeight: 'normal',
        gridThickness: 1,
        gridColor: 'rgba(255, 255, 255, 0.1)',
        lineThickness: 1,
        lineColor: 'rgba(255, 255, 255, 0.3)',
        tickThickness: 1,
        tickColor: 'rgba(255, 255, 255, 0.3)',
        interval: calculatedInterval,
        maximum: calculatedMaximum,
        minimum: 0,
        includeZero: true,
        suffix: 'K',
      },
      legend: {
        cursor: 'pointer',
        fontColor: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        horizontalAlign: 'center',
        verticalAlign: 'top',
        itemclick: function (e: any) {
          if (
            typeof e.dataSeries.visible === 'undefined' ||
            e.dataSeries.visible
          ) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        },
      },
      toolTip: {
        enabled: true,
        fontColor: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#4FD1C7',
        borderThickness: 1,
        cornerRadius: 5,
      },
      data: [
        {
          type: 'line',
          name: 'الإيرادات (رس)',
          showInLegend: true,
          color: '#46E3FF',
          markerSize: 8,
          markerType: 'circle',
          lineThickness: 3,
          dataPoints: this.revenueTrendData.map((item) => ({
            label: item.days, // X-axis: days from API
            y: item.values, // Y-axis: values from API
          })),
        },
      ],
    };
  }

  // ===============================  Weekly Performance Chart (الأداء الأسبوعي) ==============================
  private updateWeeklyPerformanceChart(): void {
    this.weeklyPerformanceChartOptions = {
      animationEnabled: true,
      backgroundColor: 'transparent',
      title: {
        text: 'الأداء الأسبوعي',
        fontColor: '#FFFFFF',
        fontSize: 20,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        horizontalAlign: 'center',
      },
      axisX: {
        labelFontColor: '#FFFFFF',
        labelFontSize: 14,
        labelFontFamily: 'Arial, sans-serif',
        labelFontWeight: 'normal',
        gridThickness: 1,
        gridColor: '#333',
        lineThickness: 0,
        tickThickness: 0,
      },
      axisY: {
        labelFontColor: '#FFFFFF',
        labelFontSize: 14,
        labelFontFamily: 'Arial, sans-serif',
        labelFontWeight: 'normal',
        gridThickness: 1,
        gridColor: '#333',
        lineThickness: 0,
        tickThickness: 0,
        interval: 8,
        maximum: 32,
      },
      legend: {
        cursor: 'pointer',
        fontColor: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        itemclick: function (e: any) {
          if (
            typeof e.dataSeries.visible === 'undefined' ||
            e.dataSeries.visible
          ) {
            e.dataSeries.visible = false;
          } else {
            e.dataSeries.visible = true;
          }
          e.chart.render();
        },
      },
      data: [
        {
          type: 'column',
          name: 'عملاء متوقعين',
          showInLegend: true,
          color: '#2A8899', // You cannot use CSS gradients for CanvasJS color, only solid colors or hex codes
          dataPoints: this.weeklyPerformanceData.map((item: any) => ({
            label: item.jobTitle,
            y: item.jobTitleCount,
          })),
        },
        {
          type: 'column',
          name: 'تم التحويل',
          showInLegend: true,
          color: '#265A4A', // Again, use solid color hex code or CSS color string, no gradients
          dataPoints: this.weeklyPerformanceData.map((item: any) => ({
            label: item.jobTitle,
            y: item.converted,
          })),
        },
      ],
    };
  }

  // =============================== lead status Chart (حالة العميل ) ==============================
  private GetLeadStatusPercentages(): void {
    this._ChartService.GetLeadStatusPercentagesAsync().subscribe({
      next: (response) => {
        if (response?.succeeded && response?.data) {
          this.leadStatusData = response.data.map((item: any) => ({
            stage: item.status || item.stage || 'غير مُسمى',
            stageCount:
              item.percentage !== undefined
                ? item.percentage
                : item.count || item.stageCount || 0,
          }));
          this.updateLeadStatusChart();
        } else {
          // Fallback: keep empty array if API fails
          this.updateLeadStatusChart();
        }
      },
      error: (error) => {
        console.error('Failed to load lead status percentages', error);
        // Fallback: keep empty array on error
        this.updateLeadStatusChart();
      },
    });
  }

  private updateLeadStatusChart(): void {
    const colors = [
      '#FF5E00', // Orange
      '#FF7E33',
      '#FF9E66',
      '#FFBE99',
      '#FFDFCC',
      '#00687A', // blue
      '#53AD92',
      '#53AD92',
      '#99F0FF',
      '#CCF7FF',
    ];

    // Calculate total count first
    const totalCount = this.leadStatusData.reduce(
      (sum, item) => sum + (item.stageCount || 0),
      0
    );

    this.leadStatusChartOption = {
      animationEnabled: true,
      backgroundColor: 'transparent',
      title: {
        text: 'حالة العميل',
        fontColor: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        horizontalAlign: 'center',
      },
      subtitle: {
        text: 'Entry Campaign',
        fontColor: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        horizontalAlign: 'center',
      },
      legend: {
        cursor: 'pointer',
        fontColor: '#FFFFFF',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        itemclick: function (e: any) {
          // For pie chart, handle dataPoint visibility instead of dataSeries
          if (e.dataPoint) {
            if (
              typeof e.dataPoint.visible === 'undefined' ||
              e.dataPoint.visible
            ) {
              e.dataPoint.visible = false;
            } else {
              e.dataPoint.visible = true;
            }
            e.chart.render();
          } else if (e.dataSeries) {
            // Fallback for other chart types
            if (
              typeof e.dataSeries.visible === 'undefined' ||
              e.dataSeries.visible
            ) {
              e.dataSeries.visible = false;
            } else {
              e.dataSeries.visible = true;
            }
            e.chart.render();
          }
        },
      },
      data: [
        {
          type: 'pie',
          indexLabelFontColor: '#FFFFFF',
          indexLabelFontSize: 12,
          indexLabelFontFamily: 'Arial, sans-serif',
          indexLabel: '{label}: {y}%',
          toolTipContent: '{label}: {y}%',
          showInLegend: true,
          dataPoints: this.leadStatusData.map((item, idx) => ({
            label: item.stage,
            name: item.stage,
            y:
              totalCount > 0
                ? Math.round((item.stageCount / totalCount) * 100 * 100) / 100
                : 0,
            color: colors[idx % colors.length],
          })),
        },
      ],
    };
  }
}
