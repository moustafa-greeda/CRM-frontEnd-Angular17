import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface DailyPeakHourStat {
  hour: number;
  day?: number | string;
  totalCalls: number;
  success: number;
  failed: number;
  rescheduled: number;
}

export interface DailyPeakHoursResponse {
  succeeded: boolean;
  data?: {
    peakMonth?: string;
    startOfMonth?: string;
    peakHours: DailyPeakHourStat[];
  };
}

export interface PerformanceStat {
  employeeName: string;
  totalCalls: number;
  successfulCalls: number;
  successRate: number;
}

export interface PerformanceChartResponse {
  succeeded: boolean;
  data?: {
    startOfMonth?: string;
    endOfMonth?: string;
    performance: PerformanceStat[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class MainChartService {
  Base_Url = environment.apiUrl;
  constructor(private http: HttpClient) {}
  // ==================================== Get Daily Peak Hours For Month ================================
  GetDailyPeakHoursForMonth(): Observable<DailyPeakHoursResponse> {
    return this.http.get<DailyPeakHoursResponse>(
      `${this.Base_Url}/AdminTeleSalesDashboard/charts/GetDailyPeakHoursForMonth`
    );
  }
  // ==================================== Get TeleSales Employees Performance ===========================
  GetTeleSalesEmployeesPerformance(): Observable<PerformanceChartResponse> {
    return this.http.get<PerformanceChartResponse>(
      `${this.Base_Url}/AdminTeleSalesDashboard/chart/GetTeleSalesEmployeesPerformance`
    );
  }
}
