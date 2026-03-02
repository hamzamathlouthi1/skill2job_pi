import { Component, OnInit } from '@angular/core';
import { AuthService, JwtResponse } from '../../../modules/services/auth.service';

@Component({
  selector: 'app-trainer-navbar',
  templateUrl: './trainer-navbar.component.html',
  styleUrls: ['./trainer-navbar.component.scss']
})
export class TrainerNavbarComponent implements OnInit {

  currentUser: JwtResponse | null = null;
  isProfileMenuOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log("Navbar user:", this.currentUser);
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  logout() {
    this.authService.logout();
    window.location.href = "/signin";
  }

  getInitials(username: string): string {
    if (!username) return "?";
    return username.charAt(0).toUpperCase();
  }

}