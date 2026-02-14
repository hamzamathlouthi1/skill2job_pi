import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { LoaderComponent } from './shared/loader/loader.component';
import { TrainingCoursesComponent } from './pages/training-courses/training-courses.component';
import { ExamsComponent } from './pages/exams/exams.component';
import { SessionsComponent } from './pages/sessions/sessions.component';
import { PartnersComponent } from './pages/partners/partners.component';
import { HrComponent } from './pages/hr/hr.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
   children: [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'users', component: UsersComponent },
  { path: 'training-courses', component: TrainingCoursesComponent },
  { path: 'exams', component: ExamsComponent },
  { path: 'sessions', component: SessionsComponent },
  { path: 'partners', component: PartnersComponent },
  { path: 'hr', component: HrComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
]
  }
];




@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
