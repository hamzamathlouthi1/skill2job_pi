import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Partnership Components
import { PartnerComponent } from './partner.component';
import { PartnerSignupComponent } from '../partner-signup/partner-signup.component';
import { AdminPartnersComponent } from '../admin-partners/admin-partners.component';
import { OffersComponent } from '../offers/offers.component';
import { PartnerHomeComponent } from '../partner-home/partner-home.component';
import { PartnerProfileComponent } from '../partner-profile/partner-profile.component';
import { PartnerDetailsComponent } from '../partner-details/partner-details.component';
import { MyApplicationsComponent } from '../my_applications/my-applications.component';
import { UserOffersComponent } from '../user-offers/user-offers.component';
import { UserOfferDetailsComponent } from '../user-offer-details/user-offer-details.component';
import { PartnerOfferApplicationsComponent } from '../partner-offer-applications/partner-offer-applications.component';
import { PartnerDashboardComponent } from '../partner-dashboard/partner-dashboard.component';
import { NotificationsBellComponent } from '../notifications-bell/notifications-bell.component';
import { PartnerCalendarComponent } from '../partner-calendar/partner-calendar.component';
import { UserLayoutComponent } from '../user-layout/user-layout.component';

@NgModule({
  declarations: [
    PartnerComponent,
    PartnerSignupComponent,
    AdminPartnersComponent,
    OffersComponent,
    PartnerHomeComponent,
    PartnerProfileComponent,
    PartnerDetailsComponent,
    MyApplicationsComponent,
    UserOffersComponent,
    UserOfferDetailsComponent,
    PartnerOfferApplicationsComponent,
    PartnerDashboardComponent,
    NotificationsBellComponent,
    PartnerCalendarComponent,
    UserLayoutComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    PartnerComponent,
    PartnerSignupComponent,
    AdminPartnersComponent,
    OffersComponent,
    PartnerHomeComponent,
    PartnerProfileComponent,
    PartnerDetailsComponent,
    MyApplicationsComponent,
    UserOffersComponent,
    UserOfferDetailsComponent,
    PartnerOfferApplicationsComponent,
    PartnerDashboardComponent,
    NotificationsBellComponent,
    PartnerCalendarComponent,
    UserLayoutComponent
  ]
})
export class PartnerModule {}