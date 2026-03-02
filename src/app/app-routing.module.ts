import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './interfaces/admin/admin.component';
import { UserComponent } from './interfaces/user/user.component';
import { LandingPageComponent } from './interfaces/landing-page/landing-page.component';
import { SigninComponent } from './interfaces/signin/signin.component';
import { SignupComponent } from './interfaces/signup/signup.component';
import { DashboardComponent } from './interfaces/shared/dashboard/dashboard.component';

import { AuthGuard } from './interfaces/guards/auth.guard';

const routes: Routes = [
  // 🌍 Public routes
  { path: '', component: LandingPageComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },

  // 🔐 Protected routes (role-based)
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { role: 'ROLE_ADMIN' }
  },
  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard],
    data: { role: 'ROLE_LEARNER' }
  },

  // ✅ Become Trainer (Learner)
{
  path: 'become-trainer',
  canActivate: [AuthGuard],
  data: { role: 'ROLE_LEARNER' },
  loadChildren: () =>
    import('./modules/trainer-portal/trainer-portal.module')
      .then(m => m.TrainerPortalModule)
},

// ✅ Trainer Portal (Trainer)
{
  path: 'trainer',
  canActivate: [AuthGuard],
  data: { role: 'ROLE_TRAINER' },
  loadChildren: () =>
    import('./modules/trainer-portal/trainer-portal.module')
      .then(m => m.TrainerPortalModule)
},

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },

  // ❌ Fallback
  { path: '**', redirectTo: 'signin' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}