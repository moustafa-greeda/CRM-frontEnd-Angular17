import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../Auth/login/auth.service';

@Injectable({
  providedIn: 'root',
})
export class LoginGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isAuthenticated()) {
      // User is already logged in, redirect to appropriate dashboard
      const userRoles = this.authService.getUserRoles();
      const userRole =
        userRoles && userRoles.length > 0 ? userRoles[0] : 'Customer';

      switch (userRole) {
        case 'Admin':
          this.router.navigate(['/dashboard/admin']);
          break;
        case 'Customer':
          this.router.navigate(['/dashboard/customer']);
          break;
        case 'Employee':
          this.router.navigate(['/dashboard/employee']);
          break;
        default:
          this.router.navigate(['/dashboard/admin']);
      }
      return false;
    }

    return true; // Allow access to login page
  }
}
