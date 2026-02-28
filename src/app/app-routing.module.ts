import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './interfaces/admin/admin.component';
import { UserComponent } from './interfaces/user/user.component';
import { TrainerComponent } from './interfaces/trainer/trainer.component';
import { LandingPageComponent } from './interfaces/landing-page/landing-page.component';
import { SigninComponent } from './interfaces/signin/signin.component';
import { SignupComponent } from './interfaces/signup/signup.component';
import { DashboardComponent } from './interfaces/shared/dashboard/dashboard.component';

import { TrainingCoursesComponent } from './modules/training-courses/training-courses.component';
import { CourseDetailsComponent } from './modules/training-courses/admin/course-details/course-details.component';
import { UserCoursesComponent } from './modules/training-courses/user/user-courses/user-courses.component';
import { PaymentComponent } from './modules/training-courses/payment/payment.component'; 
import { WalletDashboardComponent } from './modules/training-courses/wallet/wallet-dashboard/wallet-dashboard.component';
import { EnrolledCourseComponent } from './modules/training-courses/user/enrolled-course/enrolled-course.component';

import { AuthGuard } from './interfaces/guards/auth.guard';

const routes: Routes = [
  { path: '', component: LandingPageComponent },

  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },

  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { role: 'ROLE_ADMIN' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { role: 'ROLE_ADMIN' } },
      { path: 'training-courses', component: TrainingCoursesComponent, canActivate: [AuthGuard], data: { role: 'ROLE_ADMIN' } },
      { path: 'training-courses/:id', component: CourseDetailsComponent, canActivate: [AuthGuard], data: { role: 'ROLE_ADMIN' } }
    ]
  },

  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard],
    data: { role: 'ROLE_LEARNER' },
    children: [
      // ✅ Redirection par défaut vers courses
      { path: '', redirectTo: 'courses', pathMatch: 'full' },
      
      // ✅ Page principale des cours (avec tous les tabs)
      { path: 'courses', component: UserCoursesComponent, canActivate: [AuthGuard], data: { role: 'ROLE_LEARNER' } },
      
      // ✅ Page de paiement
      { path: 'payment', component: PaymentComponent, canActivate: [AuthGuard], data: { role: 'ROLE_LEARNER' } },
      
      // ✅ Page wallet
      { path: 'wallet', component: WalletDashboardComponent, canActivate: [AuthGuard], data: { role: 'ROLE_LEARNER' } },
      
      // ✅ Contenu du cours (enrolled)
      { path: 'courses/:id', component: EnrolledCourseComponent, canActivate: [AuthGuard], data: { role: 'ROLE_LEARNER' } }
    ]
  },

  {
    path: 'trainer',
    component: TrainerComponent,
    canActivate: [AuthGuard],
    data: { role: 'ROLE_TRAINER' }
  },

  { path: '**', redirectTo: 'signin' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}