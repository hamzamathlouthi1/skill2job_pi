import { Component, OnInit } from '@angular/core';
import { AuthService, JwtResponse } from '../../modules/services/auth.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  currentUser: JwtResponse | null = null;
  isProfileMenuOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {

    this.currentUser = this.authService.getCurrentUser();

    console.log("Connected user:", this.currentUser);

    if (!this.currentUser) {
      console.warn("No user found in localStorage");
    }

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

  scrollTo(section: string) {
    document.getElementById(section)?.scrollIntoView({
      behavior: 'smooth'
    });
  }

}