import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  isSessionsOpen = false;
  isHrOpen = false; // ✅ AJOUT HR

  constructor(private router: Router) {

    this.router.events.subscribe(() => {

      // Ouvre automatiquement Sessions si on est dedans
      if (this.router.url.includes('/sessions')) {
        this.isSessionsOpen = true;
      }

      // ✅ Ouvre automatiquement HR si on est dans hr
      if (this.router.url.includes('/hr')) {
        this.isHrOpen = true;
      }

    });
  }

  toggleSessionsMenu() {
    this.isSessionsOpen = !this.isSessionsOpen;
  }

  // ✅ AJOUT HR
  toggleHrMenu() {
    this.isHrOpen = !this.isHrOpen;
  }
}
