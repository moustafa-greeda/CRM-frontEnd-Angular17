import { Component, OnInit } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import {
  DailyPeakHourStat,
  MainChartService,
  PerformanceStat,
} from './main-chart.service';

interface CallResultsData {
  label: string;
  hour: number;
  day?: number;
  totalCalls: number;
  successCalls: number;
  failedCalls: number;
  rescheduledCalls: number;
}

interface TimeSlotData {
  time: string;
  x?: number;
  y?: number;
  calls: number;
  successful: number;
}

@Component({
  selector: 'app-first-charts',
  templateUrl: './first-charts.component.html',
  styleUrls: ['./first-charts.component.css'],
})
export class ChartsTeleSalesComponent implements OnInit {
  constructor(private _ChartService: MainChartService) {}
  // Call Results Analysis (تحليل نتائج المكالمات) - Area Chart
  callResultsData: CallResultsData[] = [];
  callResultsChartOptions: any = {};
  callResultsReady = false;

  // Weekly Call Performance (أداء المكالمات الأسبوعي) - Bar Chart
  timeSlotData: TimeSlotData[] = [];
  weeklyCallPerformanceChartOptions: any = {};
  weeklyChartReady = false;

  loadingCharts = true;

  get chartsReady(): boolean {
    return this.callResultsReady && this.weeklyChartReady;
  }

  ngOnInit(): void {
    this.loadPeakHours();
    this.loadPerformanceChart();
  }

  // private loadPeakHours(): void {
  //   this._ChartService
  //     .GetDailyPeakHoursForMonth()
  //     .pipe(
  //       map((response) => response?.data?.peakHours ?? []),
  //       catchError((error) => {
  //         console.error('Failed to load peak hours chart data', error);
  //         return of([] as DailyPeakHourStat[]);
  //       })
  //     )
  //     .subscribe((peakHours) => {
  //       this.callResultsData = peakHours.map((item) => {
  //         const hourLabel = this.formatHourLabel(item.hour);
  //         const dayLabel = this.formatDayLabel(item.day);
  //         const label = dayLabel ? `${hourLabel}` : hourLabel;

  //         return {
  //           label,
  //           day: this.parseDayValue(item.day),
  //           totalCalls: item.totalCalls ?? 0,
  //           successCalls: item.success ?? 0,
  //           failedCalls: item.failed ?? 0,
  //           rescheduledCalls: item.rescheduled ?? 0,
  //         };
  //       });

  //       this.timeSlotData = this.callResultsData.map((item) => ({
  //         time: item.label,
  //         calls: item.totalCalls,
  //         successful: item.successCalls,
  //       }));

  //       this.updateCallResultsChart();
  //       this.updateWeeklyCallPerformanceChart();
  //     });
  // }

  private loadPeakHours(): void {
    this._ChartService
      .GetDailyPeakHoursForMonth()
      .pipe(
        map((response) => response?.data?.peakHours ?? []),
        catchError((error) => {
          console.error('Failed to load peak hours chart data', error);
          return of([] as DailyPeakHourStat[]);
        })
      )
      .subscribe((peakHours) => {
        this.callResultsData = peakHours
          .map((item) => ({
            hour: item.hour ?? 0,
            day: this.parseDayValue(item.day),
            label: this.formatHourLabel(item.hour ?? 0),
            totalCalls: item.totalCalls ?? 0,
            successCalls: item.success ?? 0,
            failedCalls: item.failed ?? 0,
            rescheduledCalls: item.rescheduled ?? 0,
          }))
          .sort((a, b) => a.hour - b.hour);

        this.updateCallResultsChart();
        this.callResultsReady = true;
        this.updateChartsLoadingState();
      });
  }

  private loadPerformanceChart(): void {
    this._ChartService
      .GetTeleSalesEmployeesPerformance()
      .pipe(
        map((response) => response?.data?.performance ?? []),
        catchError((error) => {
          console.error(
            'Failed to load telesales employees performance chart data',
            error
          );
          return of([] as PerformanceStat[]);
        })
      )
      .subscribe((performance) => {
        this.timeSlotData = performance.map((item) => ({
          time: item.employeeName,
          calls: item.totalCalls ?? 0,
          successful: item.successfulCalls ?? 0,
        }));
        this.updateWeeklyCallPerformanceChart();
        this.weeklyChartReady = true;
        this.updateChartsLoadingState();
      });
  }

  private formatHourLabel(hour: number): string {
    if (hour === undefined || hour === null) {
      return '';
    }
    const isMorning = hour < 12;
    const normalizedHour = hour % 12 || 12;
    return `${normalizedHour} ${isMorning ? 'ص' : 'م'}`;
  }

  // =============================== Call Results Analysis Chart (تحليل نتائج المكالمات) ==============================
  // private updateCallResultsChart(): void {
  //   const allValues = this.callResultsData.flatMap((item) => [
  //     item.totalCalls,
  //     item.successCalls,
  //     item.failedCalls,
  //   ]);
  //   const maxValue = allValues.length ? Math.max(...allValues) : 0;
  //   const yMax = maxValue > 0 ? this.roundUpToNearest(maxValue, 5) : 5;
  //   const interval = Math.max(1, Math.floor(yMax / 5));

  //   const seriesConfig = [
  //     {
  //       name: 'إجمالي المكالمات',
  //       fill: 'rgba(0, 212, 255, 0.45)',
  //       line: '#00E0FF',
  //       marker: '#00E0FF',
  //       getValue: (item: CallResultsData) => item.totalCalls,
  //     },
  //     {
  //       name: 'مكالمات ناجحة',
  //       fill: 'rgba(0, 255, 183, 0.35)',
  //       line: '#52FFA8',
  //       marker: '#52FFA8',
  //       getValue: (item: CallResultsData) => item.successCalls,
  //     },
  //     {
  //       name: 'مكالمات فاشلة',
  //       fill: 'rgba(255, 107, 53, 0.35)',
  //       line: '#FF7A3C',
  //       marker: '#FF7A3C',
  //       getValue: (item: CallResultsData) => item.failedCalls,
  //     },
  //   ];

  //   this.callResultsChartOptions = {
  //     animationEnabled: true,
  //     backgroundColor: 'transparent',
  //     title: {
  //       text: 'تحليل نتائج المكالمات',
  //       fontColor: '#FFFFFF',
  //       fontSize: 18,
  //       fontFamily: 'Arial, sans-serif',
  //       fontWeight: 'bold',
  //       horizontalAlign: 'center',
  //       padding: 10,
  //     },
  //     axisX: {
  //       labelFontColor: '#d2e1ff',
  //       labelFontSize: 13,
  //       labelFontFamily: 'Tajawal, sans-serif',
  //       gridThickness: 0,
  //       lineThickness: 0,
  //       tickThickness: 0,
  //       interval: 1,
  //       minimum: 0,
  //       maximum: 23,
  //       labelFormatter: (e: any) => this.formatHourLabel(e.value),
  //     },
  //     axisY: {
  //       labelFontColor: '#d2e1ff',
  //       labelFontSize: 12,
  //       labelFontFamily: 'Tajawal, sans-serif',
  //       gridThickness: 0.6,
  //       gridColor: 'rgba(255,255,255,0.12)',
  //       lineThickness: 0,
  //       tickThickness: 0,
  //       maximum: yMax,
  //       minimum: 0,
  //       interval,
  //     },
  //     toolTip: {
  //       shared: true,
  //       backgroundColor: '#031120',
  //       borderColor: '#00E0FF',
  //       fontColor: '#e2f4ff',
  //       contentFormatter: (e: any) => this.buildAreaTooltip(e.entries),
  //     },
  //     legend: {
  //       cursor: 'pointer',
  //       fontColor: '#FFFFFF',
  //       fontSize: 12,
  //       fontFamily: 'Arial, sans-serif',
  //       horizontalAlign: 'center',
  //       verticalAlign: 'bottom',
  //       itemclick: function (evt: any) {
  //         if (
  //           typeof evt.dataSeries.visible === 'undefined' ||
  //           evt.dataSeries.visible
  //         ) {
  //           evt.dataSeries.visible = false;
  //         } else {
  //           evt.dataSeries.visible = true;
  //         }
  //         evt.chart.render();
  //       },
  //     },
  //     data: seriesConfig.map((config) => ({
  //       type: 'splineArea',
  //       name: config.name,
  //       showInLegend: true,
  //       color: config.fill,
  //       lineColor: config.line,
  //       markerColor: config.marker,
  //       markerSize: 4,
  //       dataPoints: this.callResultsData.map((item) => ({
  //         x: item.hour,
  //         y: config.getValue(item),
  //         label: item.label,
  //       })),
  //     })),
  //   };
  // }

  private updateCallResultsChart(): void {
    const seriesConfig = [
      {
        name: 'إجمالي المكالمات',
        fill: 'rgba(0, 212, 255, 0.45)',
        line: '#00E0FF',
        marker: '#00E0FF',
        getValue: (item: CallResultsData) => item.totalCalls,
      },
      {
        name: 'مكالمات ناجحة',
        fill: 'rgba(0, 255, 183, 0.35)',
        line: '#52FFA8',
        marker: '#52FFA8',
        getValue: (item: CallResultsData) => item.successCalls,
      },
      {
        name: 'مكالمات فاشلة',
        fill: 'rgba(255, 107, 53, 0.35)',
        line: '#FF7A3C',
        marker: '#FF7A3C',
        getValue: (item: CallResultsData) => item.failedCalls,
      },
    ];

    this.callResultsChartOptions = {
      animationEnabled: true,
      backgroundColor: 'transparent',
      title: {
        text: 'تحليل نتائج المكالمات',
        fontColor: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        horizontalAlign: 'center',
        padding: 10,
      },

      axisX: {
        title: 'اليوم',
        titleFontColor: '#51C09E',
        labelFontColor: '#fff',
        labelFontSize: 13,
        labelFontFamily: 'Tajawal, sans-serif',
        gridThickness: 0,
        lineThickness: 0,
        tickThickness: 0,
        minimum: 1, // الحد الأدنى لليوم
        maximum: 31, // الحد الأقصى لليوم
        interval: 1, // عرض كل يوم
        labelFormatter: (e: any) => {
          // التأكد من أن المحور X يعرض اليوم فقط كرقم (بدون AM/PM أو أي إضافات أخرى)
          return `${e.value}`;
        },
      },

      axisY: {
        title: 'الساعة',
        titleFontColor: '#51C09E',
        labelFontColor: '#fff',
        labelFontSize: 12,
        labelFontFamily: 'Tajawal, sans-serif',
        gridThickness: 0.6,
        lineThickness: 0,
        tickThickness: 0,
        minimum: 0,
        maximum: 24,
        interval: 1,
        labelFormatter: (e: any) => this.formatHourLabel(e.value),
      },
      toolTip: {
        shared: true,
        backgroundColor: '#031120',
        borderColor: '#00E0FF',
        fontColor: '#e2f4ff',
        contentFormatter: (e: any) => this.buildAreaTooltip(e.entries),
      },
      legend: {
        cursor: 'pointer',
        fontColor: '#FFFFFF',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
        horizontalAlign: 'center',
        verticalAlign: 'bottom',
      },
      data: seriesConfig.map((config) => ({
        type: 'splineArea',
        name: config.name,
        showInLegend: true,
        color: config.fill,
        lineColor: config.line,
        markerColor: config.marker,
        markerSize: 4,
        dataPoints: this.callResultsData.map((item) => ({
          x: item.day ?? 0,
          y: item.hour ?? 0,
          label: item.label,
        })),
      })),
    };
  }

  // private updateCallResultsChart(): void {
  //   const allValues = this.callResultsData.flatMap((item) => [
  //     item.totalCalls,
  //     item.successCalls,
  //     item.failedCalls,
  //   ]);
  //   const maxValue = allValues.length ? Math.max(...allValues) : 0;
  //   const xMax = maxValue > 0 ? this.roundUpToNearest(maxValue, 5) : 5;
  //   const xInterval = Math.max(1, Math.floor(xMax / 5));

  //   const seriesConfig = [
  //     {
  //       name: 'إجمالي المكالمات',
  //       fill: 'rgba(0, 212, 255, 0.45)',
  //       line: '#00E0FF',
  //       marker: '#00E0FF',
  //       getValue: (item: CallResultsData) => item.totalCalls,
  //     },
  //     {
  //       name: 'مكالمات ناجحة',
  //       fill: 'rgba(0, 255, 183, 0.35)',
  //       line: '#52FFA8',
  //       marker: '#52FFA8',
  //       getValue: (item: CallResultsData) => item.successCalls,
  //     },
  //     {
  //       name: 'مكالمات فاشلة',
  //       fill: 'rgba(255, 107, 53, 0.35)',
  //       line: '#FF7A3C',
  //       marker: '#FF7A3C',
  //       getValue: (item: CallResultsData) => item.failedCalls,
  //     },
  //   ];

  //   this.callResultsChartOptions = {
  //     animationEnabled: true,
  //     backgroundColor: 'transparent',
  //     title: {
  //       text: 'تحليل نتائج المكالمات',
  //       fontColor: '#FFFFFF',
  //       fontSize: 18,
  //       fontFamily: 'Arial, sans-serif',
  //       fontWeight: 'bold',
  //       horizontalAlign: 'center',
  //       padding: 10,
  //     },
  //     axisX: {
  //       title: 'عدد المكالمات',
  //       labelFontColor: '#d2e1ff',
  //       labelFontSize: 13,
  //       labelFontFamily: 'Tajawal, sans-serif',
  //       gridThickness: 0,
  //       lineThickness: 0,
  //       tickThickness: 0,
  //       interval: xInterval,
  //       minimum: 0,
  //       maximum: xMax,
  //     },
  //     axisY: {
  //       title: 'الساعة',
  //       labelFontColor: '#d2e1ff',
  //       labelFontSize: 12,
  //       labelFontFamily: 'Tajawal, sans-serif',
  //       gridThickness: 0.6,
  //       gridColor: 'rgba(255,255,255,0.12)',
  //       lineThickness: 0,
  //       tickThickness: 0,
  //       interval: 1,
  //       minimum: 0,
  //       maximum: 23,
  //       labelFormatter: (e: any) => this.formatHourLabel(e.value),
  //     },
  //     toolTip: {
  //       shared: true,
  //       backgroundColor: '#031120',
  //       borderColor: '#00E0FF',
  //       fontColor: '#e2f4ff',
  //       contentFormatter: (e: any) => this.buildAreaTooltip(e.entries),
  //     },
  //     legend: {
  //       cursor: 'pointer',
  //       fontColor: '#FFFFFF',
  //       fontSize: 12,
  //       fontFamily: 'Arial, sans-serif',
  //       horizontalAlign: 'center',
  //       verticalAlign: 'bottom',
  //       itemclick: function (evt: any) {
  //         if (
  //           typeof evt.dataSeries.visible === 'undefined' ||
  //           evt.dataSeries.visible
  //         ) {
  //           evt.dataSeries.visible = false;
  //         } else {
  //           evt.dataSeries.visible = true;
  //         }
  //         evt.chart.render();
  //       },
  //     },
  //     data: seriesConfig.map((config) => ({
  //       type: 'splineArea',
  //       name: config.name,
  //       showInLegend: true,
  //       color: config.fill,
  //       lineColor: config.line,
  //       markerColor: config.marker,
  //       markerSize: 4,
  //       dataPoints: this.callResultsData.map((item) => ({
  //         x: config.getValue(item),
  //         y: item.hour,
  //         label: item.label,
  //       })),
  //     })),
  //   };
  // }

  // =============================== Weekly Call Performance Chart (أداء المكالمات الأسبوعي) ==============================
  // private updateWeeklyCallPerformanceChart(): void {
  //   this.weeklyCallPerformanceChartOptions = {
  //     animationEnabled: true,
  //     backgroundColor: 'transparent',
  //     type: 'splineArea',
  //     title: {
  //       text: 'أداء المكالمات الأسبوعي',
  //       fontColor: '#FFFFFF',
  //       fontSize: 18,
  //       fontFamily: 'Arial, sans-serif',
  //       fontWeight: 'bold',
  //       horizontalAlign: 'center',
  //       padding: 10,
  //     },
  //     axisX: {
  //       labelFontColor: '#FFFFFF',
  //       labelFontSize: 12,
  //       labelFontFamily: 'Arial, sans-serif',
  //       gridThickness: 1,
  //       gridColor: '#333',
  //       lineThickness: 0,
  //       tickThickness: 0,
  //     },
  //     axisY: {
  //       labelFontColor: '#FFFFFF',
  //       labelFontSize: 12,
  //       labelFontFamily: 'Arial, sans-serif',
  //       gridThickness: 1,
  //       gridColor: '#333',
  //       lineThickness: 0,
  //       tickThickness: 0,
  //       interval: 2,
  //       maximum: 31,
  //       minimum: 0,
  //     },
  //     legend: {
  //       cursor: 'pointer',
  //       fontColor: '#FFFFFF',
  //       fontSize: 12,
  //       fontFamily: 'Arial, sans-serif',
  //       itemclick: function (e: any) {
  //         if (
  //           typeof e.dataSeries.visible === 'undefined' ||
  //           e.dataSeries.visible
  //         ) {
  //           e.dataSeries.visible = false;
  //         } else {
  //           e.dataSeries.visible = true;
  //         }
  //         e.chart.render();
  //       },
  //     },
  //     data: [
  //       {
  //         type: 'column',
  //         name: 'مكالمات',
  //         showInLegend: true,
  //         color: '#2ECC71',
  //         dataPoints: this.timeSlotData.map((item) => ({
  //           label: item.time,
  //           y: item.calls,
  //         })),
  //       },
  //       {
  //         type: 'column',
  //         name: 'ناجحة',
  //         showInLegend: true,
  //         color: '#5DADE2',
  //         dataPoints: this.timeSlotData.map((item) => ({
  //           label: item.time,
  //           y: item.successful,
  //         })),
  //       },
  //     ],
  //   };
  // }

  private updateWeeklyCallPerformanceChart(): void {
    // حساب نسبة المكالمات الناجحة لكل فترة
    const timeSlotDataWithSuccessRate = this.timeSlotData.map((item) => {
      const successRate =
        item.calls > 0 ? (item.successful / item.calls) * 100 : 0; // حساب النسبة
      return {
        ...item,
        successRate: successRate, // إضافة النسبة المحسوبة
      };
    });

    this.weeklyCallPerformanceChartOptions = {
      animationEnabled: true,
      backgroundColor: 'transparent',
      type: 'splineArea',
      title: {
        text: 'أداء المكالمات الأسبوعي',
        fontColor: '#FFFFFF',
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        horizontalAlign: 'center',
        padding: 10,
      },
      axisX: {
        labelFontColor: '#FFFFFF',
        labelFontSize: 12,
        labelFontFamily: 'Arial, sans-serif',
        gridThickness: 1,
        gridColor: '#333',
        lineThickness: 0,
        tickThickness: 0,
      },
      axisY: {
        labelFontColor: '#FFFFFF',
        labelFontSize: 12,
        labelFontFamily: 'Arial, sans-serif',
        gridThickness: 1,
        gridColor: '#333',
        lineThickness: 0,
        tickThickness: 0,
        interval: 10, // ضبط الـ interval وفقاً للنسبة (من 0 إلى 100)
        maximum: 100, // الحد الأقصى لنسبة النجاح
        minimum: 0, // الحد الأدنى لنسبة النجاح
        title: 'نسبة المكالمات الناجحة (%)',
        titleFontColor: '#51C09E',
      },
      legend: {
        cursor: 'pointer',
        fontColor: '#FFFFFF',
        fontSize: 12,
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
          name: 'مكالمات',
          showInLegend: true,
          color: '#51C09E',
          dataPoints: timeSlotDataWithSuccessRate.map((item) => ({
            label: item.time,
            y: item.calls, // هنا نعرض عدد المكالمات الإجمالية
          })),
        },
        {
          type: 'column',
          name: 'ناجحة',
          showInLegend: true,
          color: '#5DADE2',
          dataPoints: timeSlotDataWithSuccessRate.map((item) => ({
            label: item.time,
            y: item.successful, // هنا نعرض عدد المكالمات الناجحة
          })),
        },
        {
          type: 'column', // العمود الذي يعرض نسبة المكالمات الناجحة
          name: 'نسبة المكالمات الناجحة',
          showInLegend: true,
          color: '#FF6347',
          dataPoints: timeSlotDataWithSuccessRate.map((item) => ({
            label: item.time,
            y: item.successRate, // عرض نسبة المكالمات الناجحة
          })),
        },
      ],
    };
  }

  private updateChartsLoadingState(): void {
    this.loadingCharts = !(this.callResultsReady && this.weeklyChartReady);
  }

  private formatDayLabel(day?: number | string): string {
    if (day === undefined || day === null) {
      return '';
    }

    if (typeof day === 'number' && !Number.isNaN(day)) {
      return `اليوم ${day}`;
    }

    const trimmed = String(day).trim();
    return trimmed.length ? trimmed : '';
  }

  private parseDayValue(day?: number | string): number | undefined {
    if (day === undefined || day === null) {
      return undefined;
    }
    if (typeof day === 'number' && !Number.isNaN(day)) {
      return day;
    }
    const parsed = Number(day);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private roundUpToNearest(value: number, nearest: number): number {
    if (nearest <= 0) {
      return value;
    }
    return Math.ceil(value / nearest) * nearest;
  }

  private buildAreaTooltip(entries: any[]): string {
    if (!entries || !entries.length) {
      return '';
    }
    const hourValue = entries[0].dataPoint?.x ?? 0;
    const formattedHour = this.formatHourLabel(hourValue);
    const dayValue = this.callResultsData.find(
      (item) => item.hour === hourValue
    )?.day;
    const header = `<span style="color:#00E0FF;font-weight:bold">${formattedHour}</span>`;
    const dayLine = dayValue
      ? `<br/><span style="color:#8fb7ff">اليوم ${dayValue}</span>`
      : '';
    const lines = entries
      .map(
        (entry: any) =>
          `<br/><span style="color:${entry.dataSeries.lineColor}">${entry.dataSeries.name}: ${entry.dataPoint.y}</span>`
      )
      .join('');
    return `${header}${dayLine}${lines}`;
  }
}
