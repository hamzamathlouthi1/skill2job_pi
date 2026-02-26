import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; // ✅ un seul import

import { JwtInterceptor } from './modules/services/jwt.interceptor';
import { AuthGuard } from './interfaces/guards/auth.guard'; // ✅ ajouté
import { SignupComponent } from './interfaces/signup/signup.component'; // ✅ ajout

import { ExamsComponent } from './interfaces/exams-back/exams.component';
import { ExamFormComponent } from './interfaces/exams-back/components/exam-form/exam-form.component';
import { ExamTableComponent } from './interfaces/exams-back/components/exam-table/exam-table.component';
import { QuestionFormComponent } from './interfaces/exams-back/components/question-form/question-form.component';
import { EvaluationTableComponent } from './interfaces/exams-back/components/evaluation-table/evaluation-table.component';
import { CertificateListComponent } from './interfaces/exams-back/components/certificate-list/certificate-list.component';
import { CertificateDetailsComponent } from './interfaces/exams-back/components/certificate-details/certificate-details.component';
import { CertificateGenerateComponent } from './interfaces/exams-back/components/certificate-generate/certificate-generate.component';





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
    ExamsComponent,
    ExamFormComponent,
    ExamTableComponent,
    QuestionFormComponent,
    EvaluationTableComponent,
    CertificateListComponent,
    CertificateDetailsComponent,
    CertificateGenerateComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
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
