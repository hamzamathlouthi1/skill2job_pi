import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Pages / Interfaces
import { AdminComponent } from './interfaces/admin/admin.component';
import { UserComponent } from './interfaces/user/user.component';
import { LandingPageComponent } from './interfaces/landing-page/landing-page.component';
import { SigninComponent } from './interfaces/signin/signin.component';
import { SignupComponent } from './interfaces/signup/signup.component';

// Shared UI
import { SidebarComponent } from './interfaces/shared/sidebar/sidebar.component';
import { NavbarComponent } from './interfaces/shared/navbar/navbar.component';
import { LoaderComponent } from './interfaces/shared/loader/loader.component';
import { DashboardComponent } from './interfaces/shared/dashboard/dashboard.component';

// Security
import { JwtInterceptor } from './modules/services/jwt.interceptor';
import { AuthGuard } from './interfaces/guards/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    UserComponent,
    LandingPageComponent,
    SigninComponent,
    SignupComponent,
    SidebarComponent,
    NavbarComponent,
    LoaderComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}