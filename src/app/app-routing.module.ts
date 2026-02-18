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
import { SessionFormComponent } from './pages/sessions/components/session-form/session-form.component'; 
import { EquipmentTableComponent } from './pages/sessions/components/equipment-table/equipment-table.component';
import { EquipmentFormComponent } from './pages/sessions/components/equipment-form/equipment-form.component';
import { SessionTableComponent } from './pages/sessions/components/session-table/session-table.component';
import { SalleTableComponent } from './pages/sessions/components/salle-table/salle-table.component';
import { SalleFormComponent } from './pages/sessions/components/salle-form/salle-form.component';
import { RoomTableComponent } from './pages/sessions/components/room-table/room-table.component';


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
  {path: 'sessions/equipments',component: EquipmentTableComponent},
  {path: 'sessions/equipments/add',component: EquipmentFormComponent},
  { path: 'sessions/equipments/edit/:id',component: EquipmentFormComponent},
  {path: 'sessions/salles',component: SalleTableComponent},
  {path: 'sessions/salles/add',component: SalleFormComponent},
  {path: 'sessions/salles/edit/:id',component: SalleFormComponent},
  {path: 'sessions/rooms', component: RoomTableComponent },
  

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
