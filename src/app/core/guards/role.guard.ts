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

    if (!userRoles || userRoles.length === 0) {
      this.router.navigate(['/login']);
      return false;
    }

    const hasRequiredRole = expectedRoles.some((role) =>
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on user's role
      const userRole = userRoles[0];
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
          this.router.navigate(['/login']);
      }
      return false;
    }

    return true;
  }
}
