import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse } from '../../Models/api-response.model';
import { IGetAllPacket } from '../../Models/common/iget-all-packet';

@Injectable({
  providedIn: 'root',
})
export class PakegsService {
  private baseUrl = environment.apiUrl;
  private packetsSubject = new BehaviorSubject<any[]>([]);
  packets$ = this.packetsSubject.asObservable();
  constructor(private http: HttpClient) {}
  // ================================ get all packets ===========================================
  loadPackets(): void {
    this.http
      .get<ApiResponse<IGetAllPacket[]>>(
        `${this.baseUrl}/SalesDashbored/GetProductBox`
      )
      .pipe(
        map((response) => {
          const packets = response?.data ?? [];
          return packets.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            description: p.description ?? '',
          }));
        }),
        catchError((error: any) => {
          // Handle network timeout and connection errors gracefully
          const errorMessage = this.getErrorMessage(error);
          console.error('[PakegsService] Failed to load packets from API:', {
            message: errorMessage,
            status: error?.status || 'Network Error',
            url: error?.url || 'Unknown',
            error: error,
          });
          this.packetsSubject.next([]);
          return of([]);
        })
      )
      .subscribe((packets) => this.packetsSubject.next(packets));
  }

  /**
   * Get user-friendly error message based on error type
   */
  private getErrorMessage(error: any): string {
    // Handle network timeout errors
    if (
      error?.error?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
      error?.message?.includes('timeout') ||
      error?.message?.includes('Timeout')
    ) {
      return 'انتهت مهلة الاتصال بالخادم. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.';
    }

    // Handle connection failures
    if (error?.status === 0 || error?.message?.includes('fetch failed')) {
      return 'فشل الاتصال بالخادم. يرجى التحقق من الاتصال بالإنترنت.';
    }

    // Handle HTTP errors
    if (error?.status) {
      if (error.status >= 500) {
        return 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.';
      }
      if (error.status === 404) {
        return 'الخدمة غير متوفرة.';
      }
      if (error.status === 403 || error.status === 401) {
        return 'ليس لديك صلاحية للوصول إلى هذه البيانات.';
      }
      return error?.error?.message || error?.message || 'حدث خطأ غير متوقع.';
    }

    return error?.message || 'حدث خطأ غير متوقع أثناء تحميل البيانات.';
  }
}
