import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { EmployerLayoutComponent } from './layout/employer-layout/employer-layout.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { TrainingCoursesComponent } from './pages/training-courses/training-courses.component';
import { ExamsComponent } from './pages/exams/exams.component';
import { SessionsComponent } from './pages/sessions/sessions.component';
import { PartnersComponent } from './pages/partners/partners.component';
import { HrComponent } from './pages/hr/hr.component';

import { SessionFormComponent } from './pages/sessions/components/session-form/session-form.component';
import { EquipmentTableComponent } from './pages/sessions/components/equipment-table/equipment-table.component';
import { EquipmentFormComponent } from './pages/sessions/components/equipment-form/equipment-form.component';

import { PartnerProfileComponent } from './pages/employer/partner-profile/partner-profile.component';
import { OffersComponent } from './pages/employer/offers/offers.component';
import { PartnerDetailsComponent } from './pages/partners/components/partner-details/partner-details.component';

const routes: Routes = [

  // =========================
  // ADMIN AREA
  // =========================
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'training-courses', component: TrainingCoursesComponent },
      { path: 'exams', component: ExamsComponent },
      { path: 'sessions', component: SessionsComponent },
      { path: 'sessions/add', component: SessionFormComponent },
      { path: 'sessions/edit/:id', component: SessionFormComponent },
      { path: 'sessions/equipments', component: EquipmentTableComponent },
      { path: 'sessions/equipments/add', component: EquipmentFormComponent },
      { path: 'partners', component: PartnersComponent },
      { path: 'hr', component: HrComponent },
      { path: 'partners/:id', component: PartnerDetailsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // =========================
  // EMPLOYER AREA
  // =========================
  {
    path: 'employer',
    component: EmployerLayoutComponent,
    children: [
      { path: 'partner-profile', component: PartnerProfileComponent },
      { path: 'offers', component: OffersComponent },
      { path: '', redirectTo: 'partner-profile', pathMatch: 'full' }
    ]
  },

  // =========================
  // FALLBACK (si mauvaise URL)
  // =========================
  {
    path: '**',
    redirectTo: 'dashboard'
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
