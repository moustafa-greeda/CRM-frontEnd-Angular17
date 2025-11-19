import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, firstValueFrom } from 'rxjs';
import { Login } from '../core/Models/login/login';
import { EmployeeService } from '../components/employee/employee/employee.service';

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
    private employeeService: EmployeeService,
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
   * Get user data from sessionStorage
   */
  getUserData(): any {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      const userData = sessionStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  /**
   * Get user type from sessionStorage
   */
  getUserType(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      const userData = this.getUserData();
      const userType = userData?.userType || userData?.userTypeName || null;
      return userType;
    } catch (error) {
      return null;
    }
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

  setAuthData(token: string, roles: string[], userData?: any): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('roles', JSON.stringify(roles));
      if (userData) {
        sessionStorage.setItem('userData', JSON.stringify(userData));
        // Store wellcomeMessage in localStorage for easy access
        if (userData.wellcomeMessage) {
          localStorage.setItem('username', userData.empName);
        }
      }
    }

    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Get username from localStorage
   */
  getUsername(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('username');
    }
    return null;
  }

  /**
   * Get user email from sessionStorage or userData
   */
  getUserEmail(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      const userData = this.getUserData();
      if (userData) {
        // Try different possible property names for email
        return (
          userData.email ||
          userData.Email ||
          userData.login ||
          userData.Login ||
          userData.userEmail ||
          null
        );
      }
      return null;
    } catch (error) {
      console.error('Error getting user email:', error);
      return null;
    }
  }

  /**
   * Get employee ID from session storage
   */
  getEmployeeId(): number | null {
    if (isPlatformBrowser(this.platformId)) {
      const userDataString = sessionStorage.getItem('userData');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          return userData?.id || userData?.employeeId || null;
        } catch (error) {
          console.error('Error parsing userData:', error);
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Get employee ID from API by matching employee name from localStorage
   */
  async getEmployeeIdFromApi(): Promise<number | null> {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      const empName = localStorage.getItem('username');
      if (!empName) {
        return null;
      }

      const response = await firstValueFrom(
        this.employeeService.getAllEmployees()
      );

      if (response.succeeded && response.data && Array.isArray(response.data)) {
        const employee = response.data.find(
          (emp: any) => emp.name === empName || emp.Name === empName
        );

        if (employee && employee.id) {
          // Save employee ID in userData for future use
          const userData = this.getUserData();
          if (userData) {
            const updatedUserData = {
              ...userData,
              id: employee.id,
              employeeId: employee.id,
            };
            sessionStorage.setItem('userData', JSON.stringify(updatedUserData));
          }
          return employee.id;
        }
      }
      return null;
    } catch (error) {
      console.error('Error fetching employee ID from API:', error);
      return null;
    }
  }

  /**
   * Get employee ID - tries from cache first, then from API
   */
  async getEmployeeIdAsync(): Promise<number | null> {
    // First try to get from sessionStorage
    const cachedId = this.getEmployeeId();
    if (cachedId) {
      return cachedId;
    }

    // If not found, fetch from API
    return await this.getEmployeeIdFromApi();
  }

  /**
   * Get redirect URL based on user type
   */
  getRedirectUrl(): string {
    const userType = this.getUserType();

    switch (userType) {
      case 'TeleSales':
        return '/dashboard/telesales';
      case 'Sales':
        return '/dashboard/sales';
      case 'Account':
        return '/dashboard/account';
      case 'Tech':
        return '/dashboard/tech';
      case 'Admin':
      default:
        return '/dashboard/admin';
    }
  }

  /**
   * Redirect user to appropriate dashboard based on user type
   */
  redirectToDashboard(): void {
    const redirectUrl = this.getRedirectUrl();
    this.router.navigate([redirectUrl]);
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
