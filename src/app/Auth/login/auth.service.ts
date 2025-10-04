import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { Login } from '../../core/Models/login/login';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  BASE_API_URL = environment.apiUrl;
  redirectUrl: string = '/dashboard/admin';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Check authentication status on service initialization
    this.checkAuthStatus();
  }

  login(model: Login): Observable<any> {
    return this.http.post(`${this.BASE_API_URL}/Auth/Login`, model);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const token = sessionStorage.getItem('token');
    const isValid = this.isTokenValid(token);

    this.isAuthenticatedSubject.next(isValid);
    return isValid;
  }

  /**
   * Get user roles from sessionStorage
   */
  getUserRoles(): string[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    try {
      const roles = sessionStorage.getItem('roles');
      return roles ? JSON.parse(roles) : [];
    } catch (error) {
      console.error('Error parsing user roles:', error);
      return [];
    }
  }

  /**
   * Get current user token
   */
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return sessionStorage.getItem('token');
  }

  /**
   * Check if token is valid (basic validation)
   */
  private isTokenValid(token: string | null): boolean {
    if (!token) {
      return false;
    }

    try {
      // Basic JWT token validation
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      // Check if token is expired
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < currentTime) {
        this.logout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }

  /**
   * Check authentication status and update subject
   */
  private checkAuthStatus(): void {
    const isAuth = this.isAuthenticated();
    this.isAuthenticatedSubject.next(isAuth);
  }

  /**
   * Logout user and clear storage
   */
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('roles');
    }

    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Set authentication data after successful login
   */
  setAuthData(token: string, roles: string[]): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('roles', JSON.stringify(roles));
    }

    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const userRoles = this.getUserRoles();
    return userRoles.includes(role);
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.some((role) => userRoles.includes(role));
  }

  /**
   * Clear all authentication data (for testing purposes)
   */
  clearAuthData(): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('roles');
    }
    this.isAuthenticatedSubject.next(false);
  }
}
