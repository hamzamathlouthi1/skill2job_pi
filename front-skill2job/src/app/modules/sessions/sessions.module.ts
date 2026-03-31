import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { SessionsRoutingModule } from './sessions-routing.module';

// sessions screens
import { SessionsTableComponent } from './sessions/sessions-table/sessions-table.component';
import { TrainerSessionsTableComponent } from './sessions/trainer-sessions-table/trainer-sessions-table.component';
import { LearnerSessionTableComponent } from './sessions/learner-sessions-table/learner-session-table.component';

// blocs
import { BlocsComponent } from './blocs/blocs.component';

// equipments
import { EquipmentTableComponent } from './equipment/equipment-table/equipment-table.component';
import { EquipmentFormComponent } from './equipment/equipment-form/equipment-form.component';
import { TrainerEquipmentTableComponent } from './equipment/trainer-equipments-table/trainer-equipments-table.component';
import { PcSearchComponent } from './equipment/pc-search/pc-search.component';

// rooms / salles
import { SalleTableComponent } from './salle/salle-table/salle-table.component';
import { SalleFormComponent } from './salle/salle-form/salle-form.component';
import { TrainerRoomsComponent } from './rooms/trainer-rooms/trainer-rooms.component';

@NgModule({
  declarations: [
    TrainerSessionsTableComponent,
    TrainerEquipmentTableComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    SessionsTableComponent,
    BlocsComponent,
    EquipmentTableComponent,
    EquipmentFormComponent,
    PcSearchComponent,
    SalleTableComponent,
    SalleFormComponent,
    TrainerRoomsComponent,
    LearnerSessionTableComponent,
    SessionsRoutingModule
  ]
})
export class SessionsModule {}