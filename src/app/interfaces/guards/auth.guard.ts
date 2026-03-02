import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../../modules/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    return this.checkAccess(route);
  }

  canActivateChild(route: ActivatedRouteSnapshot): boolean {
    return this.checkAccess(route);
  }

  private checkAccess(route: ActivatedRouteSnapshot): boolean {

    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/signin']);
      return false;
    }

    const requiredRole = route.data['role'];

    if (requiredRole && !user.roles.includes(requiredRole)) {
      this.router.navigate(['/signin']);
      return false;
    }

    return true;
  }

}