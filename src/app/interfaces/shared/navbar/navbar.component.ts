import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../modules/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  isDropdownOpen = false;
  currentUser: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  // ✅ Fixed logout method with event parameter
  logout(event: Event): void {
    event.stopPropagation(); // Stop event from bubbling up
    event.preventDefault(); // Prevent default button behavior
    
    console.log('🚪 Logout clicked');
    
    // Close dropdown first
    this.isDropdownOpen = false;
    
    // Small delay to ensure dropdown is closed before navigation
    setTimeout(() => {
      try {
        this.authService.logoutadmin();
        this.router.navigate(['/signin']);
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }, 50);
  }
}