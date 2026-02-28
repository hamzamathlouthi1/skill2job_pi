import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AdminComponent } from './interfaces/admin/admin.component';
import { UserComponent } from './interfaces/user/user.component';
import { TrainerComponent } from './interfaces/trainer/trainer.component';
import { LandingPageComponent } from './interfaces/landing-page/landing-page.component';

import { SidebarComponent } from './interfaces/shared/sidebar/sidebar.component';
import { NavbarComponent } from './interfaces/shared/navbar/navbar.component';
import { LoaderComponent } from './interfaces/shared/loader/loader.component';
import { DashboardComponent } from './interfaces/shared/dashboard/dashboard.component';

import { SigninComponent } from './interfaces/signin/signin.component';
import { SignupComponent } from './interfaces/signup/signup.component';

import { TrainingCoursesComponent } from './modules/training-courses/training-courses.component';
import { CourseDetailsComponent } from './modules/training-courses/admin/course-details/course-details.component';

import { UserCoursesComponent } from './modules/training-courses/user/user-courses/user-courses.component';
import { PaymentComponent } from './modules/training-courses/payment/payment.component'; // ✅ AJOUTÉ

import { SafeUrlPipe } from './modules/training-courses/admin/course-details/safe-url.pipe';

import { JwtInterceptor } from './modules/services/jwt.interceptor';
import { AuthGuard } from './interfaces/guards/auth.guard';
import { WalletDashboardComponent } from './modules/training-courses/wallet/wallet-dashboard/wallet-dashboard.component';
import { EnrolledCourseComponent } from './modules/training-courses/user/enrolled-course/enrolled-course.component';

@NgModule({
  declarations: [
    AppComponent,

    AdminComponent,
    UserComponent,
    TrainerComponent,
    LandingPageComponent,

    SidebarComponent,
    NavbarComponent,
    LoaderComponent,
    DashboardComponent,

    SigninComponent,
    SignupComponent,

    TrainingCoursesComponent,
    CourseDetailsComponent,

    UserCoursesComponent,
    PaymentComponent, 

    SafeUrlPipe, 
    WalletDashboardComponent,
     EnrolledCourseComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

