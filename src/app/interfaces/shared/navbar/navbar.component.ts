import { Component, OnInit } from '@angular/core';
import { AuthService, JwtResponse } from '../../../modules/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

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