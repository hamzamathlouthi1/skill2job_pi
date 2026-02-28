import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  isSessionsOpen = false;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      if (this.router.url.includes('/sessions')) {
        this.isSessionsOpen = true;
      }
    });
  }

  toggleSessionsMenu() {
    this.isSessionsOpen = !this.isSessionsOpen;
  }
}
