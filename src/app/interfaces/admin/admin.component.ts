import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../modules/services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {

  users: any[] = [];
  currentUser: any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Connected as:', this.currentUser);

    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (data: any[]) => {
        this.users = data;
        console.log('Users loaded:', data);
      },
      error: (err: any) => console.error('Error:', err)
    });
  }

  deleteUser(id: number): void {
    this.authService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== id);
      },
      error: (err: any) => console.error('Delete error:', err)
    });
  }
}