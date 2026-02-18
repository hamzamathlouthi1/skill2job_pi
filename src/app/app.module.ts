import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { LoaderComponent } from './shared/loader/loader.component';
import { TrainingCoursesComponent } from './pages/training-courses/training-courses.component';
import { ExamsComponent } from './pages/exams/exams.component';
import { SessionsComponent } from './pages/sessions/sessions.component';
import { PartnersComponent } from './pages/partners/partners.component';
import { HrComponent } from './pages/hr/hr.component';
import { SessionTableComponent } from './pages/sessions/components/session-table/session-table.component';
import { SessionFormComponent } from './pages/sessions/components/session-form/session-form.component';
import {HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { EquipmentTableComponent } from './pages/sessions/components/equipment-table/equipment-table.component';
import { EquipmentFormComponent } from './pages/sessions/components/equipment-form/equipment-form.component';
import { EmployerLayoutComponent } from './layout/employer-layout/employer-layout.component';
import { EmployerSidebarComponent } from './shared/employer-sidebar/employer-sidebar.component';
import { PartnerProfileComponent } from './pages/employer/partner-profile/partner-profile.component';
import { OffersComponent } from './pages/employer/offers/offers.component';
import { PartnerDetailsComponent } from './pages/partners/components/partner-details/partner-details.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    NavbarComponent,
    SidebarComponent,
    DashboardComponent,
    UsersComponent,
    LoaderComponent,
    TrainingCoursesComponent,
    ExamsComponent,
    SessionsComponent,
    PartnersComponent,
    HrComponent,
    SessionTableComponent,
    SessionFormComponent,
    EquipmentTableComponent,
    EmployerLayoutComponent,
    EmployerSidebarComponent,
    PartnerProfileComponent,
    OffersComponent,
    PartnerDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
