import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { AuthService } from '../../modules/services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkAccess(route);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.checkAccess(childRoute);
  }

  private checkAccess(route: ActivatedRouteSnapshot): boolean {

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/signin']);
      return false;
    }

    const requiredRole = route.data['role'];
    if (requiredRole) {
      const user = this.authService.getCurrentUser();
      const roles = user?.roles ?? [];
      const hasRole = roles.includes(requiredRole);

      if (!hasRole) {
        this.redirectByRole(roles[0]);
        return false;
      }
    }

    return true;
  }

  private redirectByRole(role: string | undefined): void {
    switch (role) {
      case 'ROLE_ADMIN':   this.router.navigate(['/admin']);   break;
      case 'ROLE_TRAINER': this.router.navigate(['/trainer']); break;
      case 'ROLE_LEARNER': this.router.navigate(['/user']);    break;
      case 'ROLE_PARTNER': this.router.navigate(['/partner']); break;
      default:             this.router.navigate(['/signin']);  break;
    }
  }
}