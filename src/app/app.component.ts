import { Component } from '@angular/core';
import { Router, NavigationStart, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  showLoader = true;
  private firstLoad = true;

  constructor(private router: Router) {

    // STARTUP loader
    setTimeout(() => {
      this.showLoader = false;
      this.firstLoad = false;
    }, 1200);

    // NAVIGATION loader
    this.router.events.subscribe(event => {

      // Show loader when navigating (but NOT first load)
      if (!this.firstLoad && event instanceof NavigationStart) {
        this.showLoader = true;
      }

      // Hide loader when page ready
      if (event instanceof NavigationEnd) {
        setTimeout(() => {
          this.showLoader = false;
        }, 500);
      }

    });
  }
}
