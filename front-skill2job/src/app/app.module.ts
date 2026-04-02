import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {  ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; // 

import { JwtInterceptor } from './modules/services/jwt.interceptor';
import { AuthGuard } from './interfaces/guards/auth.guard'; // 
import { SignupComponent } from './interfaces/signup/signup.component'; // 
import { LiveMeetComponent } from './modules/sessions/live-meet/live-meet.component';
import { HrComponent } from './modules/hr/hr.component';
import { HrApplicationsComponent } from './modules/hr/hr-applications/hr-applications.component';
import { TrainerProfilesComponent } from './modules/hr/trainer-profiles/trainer-profiles.component';
import { TrainerDetailsComponent } from './modules/hr/trainer-details/trainer-details.component';

import { ExamsComponent } from './interfaces/exams-back/exams.component';
import { ExamFormComponent } from './interfaces/exams-back/components/exam-form/exam-form.component';
import { ExamTableComponent } from './interfaces/exams-back/components/exam-table/exam-table.component';
import { QuestionFormComponent } from './interfaces/exams-back/components/question-form/question-form.component';
import { EvaluationTableComponent } from './interfaces/exams-back/components/evaluation-table/evaluation-table.component';
import { CertificateListComponent } from './interfaces/exams-back/components/certificate-list/certificate-list.component';
import { CertificateDetailsComponent } from './interfaces/exams-back/components/certificate-details/certificate-details.component';
import { CertificateGenerateComponent } from './interfaces/exams-back/components/certificate-generate/certificate-generate.component';
import { QuestionTableComponent } from './interfaces/exams-back/components/question-table/question-table.component';
import { TrainerHomeComponent } from './interfaces/trainer/trainer-home/trainer-home.component';
import { TrainerCoursesComponent } from './modules/training-courses/trainer/trainer-courses/trainer-courses.component';
import { TrainingCoursesComponent } from './modules/training-courses/training-courses.component';
import { CourseDetailsComponent } from './modules/training-courses/admin/course-details/course-details.component';
import { SafeUrlPipe } from './modules/training-courses/admin/course-details/safe-url.pipe';
import { UserCoursesComponent } from './modules/training-courses/user/user-courses/user-courses.component';
import { PaymentComponent } from './modules/training-courses/payment/payment.component';
import { WalletDashboardComponent } from './modules/training-courses/wallet/wallet-dashboard/wallet-dashboard.component';
import { EnrolledCourseComponent } from './modules/training-courses/user/enrolled-course/enrolled-course.component';

// ── Recruitment Module Imports ────────────────────────────────────────────────────
import { TrainerPortalModule } from './interfaces/trainer-portal/trainer-portal.module';
import { HrDashboardComponent } from './modules/hr-dashboard/hr-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    UserComponent,
    TrainerComponent,
    TrainerHomeComponent,
    TrainerCoursesComponent,
    TrainingCoursesComponent,
    CourseDetailsComponent,
    SafeUrlPipe,
    UserCoursesComponent,
    PaymentComponent,
    WalletDashboardComponent,
    EnrolledCourseComponent,
    LandingPageComponent,
    SidebarComponent,
    NavbarComponent,
    LoaderComponent,
    DashboardComponent,
    SigninComponent,
    SignupComponent,
    ExamsComponent,
    ExamFormComponent,
    ExamTableComponent,
    QuestionFormComponent,
    EvaluationTableComponent,
    CertificateListComponent,
    CertificateDetailsComponent,
    CertificateGenerateComponent,
    QuestionTableComponent,
    LiveMeetComponent,
    HrDashboardComponent,
    HrComponent,
    HrApplicationsComponent,
    TrainerProfilesComponent,
    TrainerDetailsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    TrainerPortalModule
  ],
  providers: [
    AuthGuard, // ✅ ajouté
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
