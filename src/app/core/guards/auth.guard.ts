import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../Auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // Check if we're in browser environment first
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return false;
    }

    // Check if there's a token in sessionStorage
    const token = sessionStorage.getItem('token');

    if (!token) {
      this.authService.redirectUrl = state.url;
      this.router.navigate(['/login']);
      return false;
    }

    // Check authentication
    const isAuthenticated = this.authService.isAuthenticated();

    if (isAuthenticated) {
      return true;
    } else {
      this.authService.redirectUrl = state.url;
      this.router.navigate(['/login']);
      return false;
    }
  }
}
