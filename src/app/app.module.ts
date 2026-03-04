import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { LoaderComponent } from './shared/loader/loader.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { TrainingCoursesComponent } from './pages/training-courses/training-courses.component';
import { ExamsComponent } from './pages/exams/exams.component';
import { SessionsComponent } from './pages/sessions/sessions.component';
import { PartnersComponent } from './pages/partners/partners.component';
import { HrComponent } from './pages/hr/hr.component';

import { SessionTableComponent } from './pages/sessions/components/session-table/session-table.component';
import { SessionFormComponent } from './pages/sessions/components/session-form/session-form.component';
import { EquipmentTableComponent } from './pages/sessions/components/equipment-table/equipment-table.component';
import { EquipmentFormComponent } from './pages/sessions/components/equipment-form/equipment-form.component';

import { TrainerProfilesComponent } from './pages/trainer-profiles/trainer-profiles.component';
import { TrainerDetailsComponent } from './pages/trainer-details/trainer-details.component';
import { HrDashboardComponent } from './pages/hr-dashboard/hr-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    NavbarComponent,
    SidebarComponent,
    LoaderComponent,

    DashboardComponent,
    UsersComponent,
    TrainingCoursesComponent,
    ExamsComponent,
    SessionsComponent,
    PartnersComponent,
    HrComponent,

    SessionTableComponent,
    SessionFormComponent,
    EquipmentTableComponent,
    EquipmentFormComponent,

    TrainerProfilesComponent,
    TrainerDetailsComponent,
    HrDashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}