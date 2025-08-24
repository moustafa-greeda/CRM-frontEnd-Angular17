import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Login } from '../../core/Models/login/login';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  BASE_API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}
  login(model: Login): Observable<any> {
    return this.http.post(`${this.BASE_API_URL}/Auth/Login`, model);
  }
}
