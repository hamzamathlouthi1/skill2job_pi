import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './interfaces/admin/admin.component';
import { UserComponent } from './interfaces/user/user.component';
import { TrainerComponent } from './interfaces/trainer/trainer.component';
import { LandingPageComponent } from './interfaces/landing-page/landing-page.component';
import { SigninComponent } from './interfaces/signin/signin.component';
import { SignupComponent } from './interfaces/signup/signup.component';
import { DashboardComponent } from './interfaces/shared/dashboard/dashboard.component';
import { BlocsComponent } from './modules/components/sessions/blocs/blocs.component';

import { AuthGuard } from './interfaces/guards/auth.guard';

import { EquipmentTableComponent } from './modules/components/sessions/equipment/equipment-table/equipment-table.component';
import { EquipmentFormComponent } from './modules/components/sessions/equipment/equipment-form/equipment-form.component';
import { SalleFormComponent } from './modules/components/sessions/salle/salle-form/salle-form.component';
import { SalleTableComponent } from './modules/components/sessions/salle/salle-table/salle-table.component';
import { SessionsTableComponent } from './modules/components/sessions/sessions/sessions-table/sessions-table.component';
import { PcSearchComponent } from './modules/components/sessions/equipment/pc-search/pc-search.component';
import { TrainerSessionsTableComponent } from './modules/components/sessions/sessions/trainer-sessions-table/trainer-sessions-table.component';
import { TrainerEquipmentTableComponent } from './modules/components/sessions/equipment/trainer-equipments-table/trainer-equipments-table.component';
import { LearnerSessionTableComponent } from './modules/components/sessions/sessions/learner-sessions-table/learner-session-table.component';
import { LiveMeetComponent } from './modules/components/sessions/live-meet/live-meet.component';
import { TrainerRoomsComponent } from './modules/components/sessions/rooms/trainer-rooms/trainer-rooms.component';


const routes: Routes = [

  // PUBLIC
  { path: '', component: LandingPageComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },


  // ADMIN LAYOUT ROUTES (IMPORTANT)
 {
  path: 'admin',
  component: AdminComponent,
  canActivate: [AuthGuard],
  canActivateChild: [AuthGuard],   // ✅ IMPORTANT FIX
  data: { role: 'ROLE_ADMIN' },

  children: [

     { path: 'dashboard', component: DashboardComponent },
     { path: 'blocs', component: BlocsComponent },
     { path: 'equipments', component: EquipmentTableComponent },
     { path: 'equipments/add', component: EquipmentFormComponent },
     {path: 'pcsearch', component: PcSearchComponent},
     { path: 'equipments/edit/:id', component: EquipmentFormComponent },
     { path: 'salles', component: SalleTableComponent },
     { path: 'salles/add', component: SalleFormComponent },
     { path: 'salles/edit/:id', component: SalleFormComponent },
     { path: 'sessions', component: SessionsTableComponent },


  ]
},



  // OTHER INTERFACES (UNCHANGED)
  {
  path: 'user',
  component: UserComponent,
  canActivate: [AuthGuard],
  canActivateChild: [AuthGuard],
  data: { role: 'ROLE_LEARNER' },
  children: [
    { path: 'sessions', component: LearnerSessionTableComponent },
    { path: 'dashboard', component: DashboardComponent },
  ]
},


{ 
  path: 'live/:sessionId/:roomCode', 
  component: LiveMeetComponent,
  canActivate: [AuthGuard] // Protect it with auth guard
},

  {
  path: 'trainer',
  component: TrainerComponent,
  canActivate: [AuthGuard],
  canActivateChild: [AuthGuard],
  data: { role: 'ROLE_TRAINER' },
  children: [

    { path: 'sessions', component: TrainerSessionsTableComponent },
    

    {path: 'equipments', component: TrainerEquipmentTableComponent },
    {path: 'virtualrooms', component: TrainerRoomsComponent },

  ]
},


  // Optional global dashboard
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },


  // FALLBACK
  { path: '**', redirectTo: 'signin' }

];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }