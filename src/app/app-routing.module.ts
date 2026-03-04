import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
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

import { TrainerProfilesComponent } from './pages/trainer-profiles/trainer-profiles.component';
import { TrainerDetailsComponent } from './pages/trainer-details/trainer-details.component';
import { HrDashboardComponent } from './pages/hr-dashboard/hr-dashboard.component';

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
      { path: 'sessions/add', component: SessionFormComponent },
      { path: 'sessions/edit/:id', component: SessionFormComponent },
      { path: 'sessions/equipments', component: EquipmentTableComponent },
      { path: 'sessions/equipments/add', component: EquipmentFormComponent },

      { path: 'partners', component: PartnersComponent },

      { path: 'hr', component: HrComponent },
      { path: 'hr/trainer-profiles', component: TrainerProfilesComponent },
      { path: 'hr/trainer-details', component: TrainerDetailsComponent },
      { path: 'hr/dashboard', component: HrDashboardComponent }, // ✅ déplacé avant redirectTo

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}