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
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const expectedRoles = route.data['roles'] as Array<string>;

    if (!expectedRoles || expectedRoles.length === 0) {
      return true; // No role restriction
    }

    const userRoles = this.authService.getUserRoles();
    const userType = this.authService.getUserType();

    if (!userRoles || userRoles.length === 0) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check both roles and userType
    const hasRequiredRole = expectedRoles.some((role) =>
      userRoles.includes(role)
    );

    const hasRequiredUserType = expectedRoles.some((role) => {
      // Map userType to roles for comparison
      switch (userType) {
        case 'TeleSales':
          return role === 'TeleSalse';
        case 'Sales':
          return role === 'Sales';
        case 'Account':
          return role === 'Account';
        case 'Tech':
          return role === 'Tech';
        case 'Admin':
          return role === 'Admin';
        default:
          return false;
      }
    });

    if (!hasRequiredRole && !hasRequiredUserType) {
      // Redirect to appropriate dashboard based on user's type
      this.authService.redirectToDashboard();
      return false;
    }

    return true;
  }
}
