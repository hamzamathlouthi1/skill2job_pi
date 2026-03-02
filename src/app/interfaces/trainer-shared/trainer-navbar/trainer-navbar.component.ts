import { Component, OnInit } from '@angular/core';
import { AuthService, JwtResponse } from '../../../modules/services/auth.service';

@Component({
  selector: 'app-trainer-navbar',
  templateUrl: './trainer-navbar.component.html',
  styleUrls: ['./trainer-navbar.component.css']
})
export class TrainerNavbarComponent implements OnInit {

  currentUser: JwtResponse | null = null;
  isProfileMenuOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/signin';
  }

  getInitials(username: string): string {
    if (!username) return '?';
    return username.charAt(0).toUpperCase();
  }
}