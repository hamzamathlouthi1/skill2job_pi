import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './interfaces/admin/admin.component';
import { UserComponent } from './interfaces/user/user.component';
import { TrainerComponent } from './interfaces/trainer/trainer.component';
import { LandingPageComponent } from './interfaces/landing-page/landing-page.component';
import { SigninComponent } from './interfaces/signin/signin.component';
import { SignupComponent } from './interfaces/signup/signup.component'; // ✅ ajout
import { DashboardComponent } from './interfaces/shared/dashboard/dashboard.component';
import { AuthGuard } from './interfaces/guards/auth.guard';
import { ExamsComponent } from './interfaces/exams-back/exams.component';
import { ExamFormComponent } from './interfaces/exams-back/components/exam-form/exam-form.component';
import { ExamTableComponent } from './interfaces/exams-back/components/exam-table/exam-table.component';
import { QuestionFormComponent } from './interfaces/exams-back/components/question-form/question-form.component';
import { EvaluationTableComponent } from './interfaces/exams-back/components/evaluation-table/evaluation-table.component';
import { CertificateListComponent } from './interfaces/exams-back/components/certificate-list/certificate-list.component';
import { CertificateDetailsComponent } from './interfaces/exams-back/components/certificate-details/certificate-details.component';
import { CertificateGenerateComponent } from './interfaces/exams-back/components/certificate-generate/certificate-generate.component';

const routes: Routes = [

  { path: '',       component: LandingPageComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },

  // Admin route - no more exam children here
  {
  path: 'admin',
  component: AdminComponent,
  canActivate: [AuthGuard],
  data: { role: 'ROLE_ADMIN' },
  children: [
    { path: 'exams/certificates/generate/:evaluationId', component: CertificateGenerateComponent },
    { path: 'exams/certificates/:id', component: CertificateDetailsComponent },
    { path: 'exams/certificates', component: CertificateListComponent },
    { path: 'exams/exam-table', component: ExamTableComponent },
    { path: 'exams/exam-form', component: ExamFormComponent },
    { path: 'exams/exam-form/:id', component: ExamFormComponent },
    { path: 'exams/question-form', component: QuestionFormComponent },
    { path: 'exams/question-form/:examId', component: QuestionFormComponent },
    { path: 'exams/evaluation-table', component: EvaluationTableComponent },
    { path: 'exams/evaluation-table/:examId', component: EvaluationTableComponent },
    { path: 'exams', component: ExamsComponent },
{ path: '', redirectTo: 'dashboard', pathMatch: 'full' } 
  ]
},

  // User route
  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard],
    data: { role: 'ROLE_LEARNER' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'exams', loadChildren: () => import('./modules/exams/exams.module').then(m => m.ExamsModule) },
      { path: 'certificates', loadChildren: () => import('./modules/certificates/certificates.module').then(m => m.CertificatesModule) }
    ]
  },
  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard],
    data: { role: 'ROLE_LEARNER' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { 
        path: 'exams', 
        loadChildren: () => import('./modules/exams/exams.module')
          .then(m => m.ExamsModule) 
      },
      { 
        path: 'certificates', 
        loadChildren: () => import('./modules/certificates/certificates.module')
          .then(m => m.CertificatesModule) 
      }
    ]
    
  },
  {
    path: 'trainer',
    component: TrainerComponent,
    canActivate: [AuthGuard],
    data: { role: 'ROLE_TRAINER' }
  },
  
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },

  { path: '**', redirectTo: 'signin' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }