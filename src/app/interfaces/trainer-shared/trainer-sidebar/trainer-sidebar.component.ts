import { Component } from '@angular/core';

@Component({
  selector: 'app-trainer-sidebar',
  templateUrl: './trainer-sidebar.component.html',
  styleUrls: ['./trainer-sidebar.component.css']
})
export class TrainerSidebarComponent {
  isSessionsOpen = false;

  toggleSessionsMenu(): void {
    this.isSessionsOpen = !this.isSessionsOpen;
  }
}