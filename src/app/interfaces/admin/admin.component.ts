import { Component, OnInit } from '@angular/core';
import { AuthService, User } from '../../modules/services/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {

  users: User[] = [];
  currentUser: any;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // ✅ Afficher l'utilisateur connecté
    this.currentUser = this.authService.getCurrentUser();
    console.log('Connecté en tant que :', this.currentUser);

    // ✅ Charger tous les users
    this.loadUsers();
  }

  loadUsers(): void {
    this.authService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        console.log('Users chargés :', data);
      },
      error: (err) => console.error('Erreur:', err)
    });
  }

  deleteUser(id: number): void {
    this.authService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== id);
      },
      error: (err) => console.error('Erreur suppression:', err)
    });
  }
}