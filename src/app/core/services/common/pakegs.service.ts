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
  // getAllPackets(): Observable<ApiResponse<IGetAllPacket[]>> {
  //   return this.http.get<ApiResponse<IGetAllPacket[]>>(
  //     `${this.baseUrl}/SalesDashbored/GetProductBox`
  //   );
  // }

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
        catchError((error) => {
          console.error(
            '[PakegsService] Failed to load packets from API:',
            error
          );
          this.packetsSubject.next([]);
          return of([]);
        })
      )
      .subscribe((packets) => this.packetsSubject.next(packets));
  }
}
