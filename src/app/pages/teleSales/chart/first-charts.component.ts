import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  signal,
  computed,
  ChangeDetectorRef,
  DestroyRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
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
  standalone: true,
  imports: [CommonModule, CanvasJSAngularChartsModule],
  templateUrl: './first-charts.component.html',
  styleUrls: ['./first-charts.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartsTeleSalesComponent implements OnInit {
  // ========== State Signals ==========
  readonly callResultsData = signal<CallResultsData[]>([]);
  readonly callResultsChartOptions = signal<any>({});
  readonly callResultsReady = signal<boolean>(false);

  readonly timeSlotData = signal<TimeSlotData[]>([]);
  readonly weeklyCallPerformanceChartOptions = signal<any>({});
  readonly weeklyChartReady = signal<boolean>(false);

  readonly chartsReady = computed(() => {
    return this.callResultsReady() && this.weeklyChartReady();
  });

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private chartService: MainChartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPeakHours();
    this.loadPerformanceChart();
  }

  private loadPeakHours(): void {
    this.chartService
      .GetDailyPeakHoursForMonth()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((response) => response?.data?.peakHours ?? []),
        catchError((error) => {
          console.error('Failed to load peak hours chart data', error);
          return of([] as DailyPeakHourStat[]);
        })
      )
      .subscribe((peakHours) => {
        const data = peakHours
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

        this.callResultsData.set(data);
        this.updateCallResultsChart();
        this.callResultsReady.set(true);
        this.cdr.markForCheck();
      });
  }

  private loadPerformanceChart(): void {
    this.chartService
      .GetTeleSalesEmployeesPerformance()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
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
        const data = performance.map((item) => ({
          time: item.employeeName,
          calls: item.totalCalls ?? 0,
          successful: item.successfulCalls ?? 0,
        }));
        this.timeSlotData.set(data);
        this.updateWeeklyCallPerformanceChart();
        this.weeklyChartReady.set(true);
        this.cdr.markForCheck();
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
  private updateCallResultsChart(): void {
    const data = this.callResultsData();
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

    const chartOptions = {
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
        interval: 2,
        labelFormatter: (e: any) => {
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
        interval: 2,
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
        dataPoints: data.map((item) => ({
          x: item.day ?? 0,
          y: item.hour ?? 0,
          label: item.label,
          callCount: config.getValue(item), // Store call count for tooltip
        })),
      })),
    };
    this.callResultsChartOptions.set(chartOptions);
  }

  // =============================== Weekly Call Performance Chart (أداء المكالمات الأسبوعي) ==============================
  private updateWeeklyCallPerformanceChart(): void {
    const data = this.timeSlotData();
    // حساب نسبة المكالمات الناجحة لكل فترة
    const timeSlotDataWithSuccessRate = data.map((item) => {
      const successRate =
        item.calls > 0 ? (item.successful / item.calls) * 100 : 0;
      return {
        ...item,
        successRate: successRate,
      };
    });

    const chartOptions = {
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
    this.weeklyCallPerformanceChartOptions.set(chartOptions);
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

  private buildAreaTooltip(entries: any[]): string {
    if (!entries || !entries.length) {
      return '';
    }
    const dayValue = entries[0].dataPoint?.x ?? 0;
    const hourValue = entries[0].dataPoint?.y ?? 0;
    const dataItem = this.callResultsData().find(
      (item) => item.day === dayValue && item.hour === hourValue
    );

    if (!dataItem) {
      return '';
    }

    const formattedHour = this.formatHourLabel(dataItem.hour);
    const header = `<span style="color:#00E0FF;font-weight:bold">${formattedHour}</span>`;
    const dayLine = dayValue
      ? `<br/><span style="color:#8fb7ff">اليوم ${dayValue}</span>`
      : '';
    const lines = entries
      .map((entry: any) => {
        // Get the actual call count from dataItem based on the series name
        let callCount = 0;
        if (entry.dataSeries.name === 'إجمالي المكالمات') {
          callCount = dataItem.totalCalls;
        } else if (entry.dataSeries.name === 'مكالمات ناجحة') {
          callCount = dataItem.successCalls;
        } else if (entry.dataSeries.name === 'مكالمات فاشلة') {
          callCount = dataItem.failedCalls;
        }
        return `<br/><span style="color:${entry.dataSeries.lineColor}">${entry.dataSeries.name}: ${callCount}</span>`;
      })
      .join('');
    return `${header}${dayLine}${lines}`;
  }
}
