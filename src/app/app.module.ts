import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminComponent } from './interfaces/admin/admin.component';
import { UserComponent } from './interfaces/user/user.component';
import { TrainerComponent } from './interfaces/trainer/trainer.component';
import { LandingPageComponent } from './interfaces/landing-page/landing-page.component';
import { SidebarComponent } from './interfaces/shared/sidebar/sidebar.component';
import { NavbarComponent } from './interfaces/shared/navbar/navbar.component';
import { LoaderComponent } from './interfaces/shared/loader/loader.component';
import { DashboardComponent } from './interfaces/shared/dashboard/dashboard.component';
import { BlocsComponent } from './modules/components/sessions/blocs/blocs.component';
import { SigninComponent } from './interfaces/signin/signin.component';

import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; // ✅ un seul import

import { JwtInterceptor } from './modules/services/jwt.interceptor';
import { AuthGuard } from './interfaces/guards/auth.guard'; // ✅ ajouté
import { SignupComponent } from './interfaces/signup/signup.component';
import { AuthService } from './modules/services/auth.service'; // ✅ ajouté
import { EquipmentTableComponent } from './modules/components/sessions/equipment/equipment-table/equipment-table.component';
import { EquipmentFormComponent } from './modules/components/sessions/equipment/equipment-form/equipment-form.component';
import { SalleFormComponent } from './modules/components/sessions/salle/salle-form/salle-form.component';
import { SalleTableComponent } from './modules/components/sessions/salle/salle-table/salle-table.component';
import { SessionsTableComponent } from './modules/components/sessions/sessions/sessions-table/sessions-table.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PcSearchComponent } from './modules/components/sessions/equipment/pc-search/pc-search.component';
import { TrainerNavbarComponent } from './interfaces/trainer-shared/trainer-navbar/trainer-navbar.component';
import { TrainerSidebarComponent } from './interfaces/trainer-shared/trainer-sidebar/trainer-sidebar.component';
import { TrainerSessionsTableComponent } from './modules/components/sessions/sessions/trainer-sessions-table/trainer-sessions-table.component';
import { TrainerEquipmentTableComponent } from './modules/components/sessions/equipment/trainer-equipments-table/trainer-equipments-table.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    UserComponent,
    TrainerComponent,
    LandingPageComponent,
    SidebarComponent,
    NavbarComponent,
    LoaderComponent,
    DashboardComponent,
    BlocsComponent,
    SigninComponent,
    SignupComponent,
    EquipmentTableComponent,
    EquipmentFormComponent,
    SalleFormComponent,
    SalleTableComponent,
    SessionsTableComponent,
    PcSearchComponent,
    TrainerSidebarComponent,
    TrainerNavbarComponent,
    TrainerSessionsTableComponent,
    TrainerEquipmentTableComponent

    
    
   

   
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatIconModule
    ,MatSnackBarModule
  ],
  providers: [
    AuthGuard, // ✅ ajouté
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }, provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
