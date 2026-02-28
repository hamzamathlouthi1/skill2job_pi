import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  Router
} from '@angular/router';
import { AuthService } from '../../modules/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {

    // 1. Pas connecté → signin
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/signin']);
      return false;
    }

    // 2. Vérifier le rôle requis pour la route
    const requiredRole = route.data['role'];
    if (requiredRole) {
      const user = this.authService.getCurrentUser();
      const userRole = user?.roles[0];

      if (userRole !== requiredRole) {
        // ✅ Redirige vers sa propre page selon son rôle
        this.redirectByRole(userRole);
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