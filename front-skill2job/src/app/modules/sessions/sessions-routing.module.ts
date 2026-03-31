import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SessionsTableComponent } from './sessions/sessions-table/sessions-table.component';
import { BlocsComponent } from './blocs/blocs.component';
import { EquipmentTableComponent } from './equipment/equipment-table/equipment-table.component';
import { EquipmentFormComponent } from './equipment/equipment-form/equipment-form.component';
import { PcSearchComponent } from './equipment/pc-search/pc-search.component';
import { SalleTableComponent } from './salle/salle-table/salle-table.component';
import { SalleFormComponent } from './salle/salle-form/salle-form.component';
import { TrainerRoomsComponent } from './rooms/trainer-rooms/trainer-rooms.component';

const routes: Routes = [
  { path: '', component: SessionsTableComponent },               // /admin/sessions
  { path: 'equipments/add', component: EquipmentFormComponent },       // /admin/sessions/equipments/add
  { path: 'equipments/edit/:id', component: EquipmentFormComponent }, // /admin/sessions/equipments/edit/:id
  { path: 'equipments', component: EquipmentTableComponent },    // /admin/sessions/equipments
  { path: 'rooms/add', component: SalleFormComponent },              // /admin/sessions/rooms/add
  { path: 'rooms/edit/:id', component: SalleFormComponent },     // /admin/sessions/rooms/edit/:id
  { path: 'rooms', component: SalleTableComponent },             // /admin/sessions/rooms
  { path: 'blocs', component: BlocsComponent },                  // /admin/sessions/blocs
  { path: 'pcsearch', component: PcSearchComponent },            // /admin/sessions/pcsearch
  { path: 'virtual-rooms', component: TrainerRoomsComponent }    // /admin/sessions/virtual-rooms
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SessionsRoutingModule {}