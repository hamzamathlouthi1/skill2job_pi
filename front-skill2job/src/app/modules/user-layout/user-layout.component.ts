import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../modules/services/auth.service';

@Component({
  selector: 'app-user-layout',
  templateUrl: './user-layout.component.html',
  styleUrls: ['./user-layout.component.scss']
})
export class UserLayoutComponent implements OnInit {

  isProfileMenuOpen = false;
  currentUser: any = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const u = this.authService.getCurrentUser();
    if (!u) {
      this.router.navigate(['/signin']);
      return;
    }
    this.currentUser = u;
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/signin']);
  }

  getInitials(name: string): string {
    if (!name) return 'GU';
    return name.substring(0, 2).toUpperCase();
  }
}