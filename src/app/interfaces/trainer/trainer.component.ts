import { Component, OnInit } from '@angular/core';
import { AuthService, JwtResponse } from '../../modules/services/auth.service';

@Component({
  selector: 'app-trainer',
  templateUrl: './trainer.component.html',
  styleUrls: ['./trainer.component.scss']
})
export class TrainerComponent implements OnInit {

  user: JwtResponse | null = null;
  currentUser: JwtResponse | null = null;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
  }

  logout() {
    this.authService.logout();
  }
}