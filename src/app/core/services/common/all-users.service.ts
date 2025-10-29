import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../Models/api-response.model';
import { User } from '../../Models/user/user.model';

@Injectable({
  providedIn: 'root',
})
export class AllUsersService {
  private BASE_API_URL = environment.apiUrl;
  constructor(private http: HttpClient) {}
  // =============================== get all users ===================
  getAllUsers(): Observable<
    ApiResponse<{ totalCount: number; items: User[] }>
  > {
    return this.http.get<ApiResponse<{ totalCount: number; items: User[] }>>(
      `${this.BASE_API_URL}/Auth/GetAllUsers`
    );
  }
}
