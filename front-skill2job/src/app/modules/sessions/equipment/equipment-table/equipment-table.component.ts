import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EquipmentService } from '../../../services/equipment.service';
import { Router } from '@angular/router';
import { Equipment } from '../../../models/equipment.model';
import { EquipmentReservation } from '../../../models/session-equipment.model';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-equipment-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './equipment-table.component.html',
  styleUrls: ['./equipment-table.component.scss']
})
export class EquipmentTableComponent implements OnInit {

  equipments: Equipment[] = [];

  constructor(
    private equipmentService: EquipmentService,
    private router: Router,
    private notify: NotificationService
  ) {}

  selectedEquipment: any = null;
  

reservations: EquipmentReservation[] = [];

showReservationsModal = false;


  ngOnInit(): void {
    this.loadEquipments();
  }

  loadEquipments() {
    this.equipmentService.getAllEquipments().subscribe({
      next: (data) => {
        this.equipments = data;
      },
      error: (err) => {
        console.error('Error loading equipments', err);
      }
    });
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="%23e2e8f0"/><text x="50%" y="50%" font-size="14" fill="%23666" text-anchor="middle" dominant-baseline="middle">No Image</text></svg>';
  }

  getPhotoUrl(filename: string): string {
    return this.equipmentService.getPhotoUrl(filename);
  }

  deleteEquipment(id: number) {
    if (confirm('Delete this equipment?')) {
      this.equipmentService.deleteEquipment(id).subscribe(() => {
        this.equipments = this.equipments.filter(e => e.id !== id);
      });
    }
  }

  editEquipment(e: Equipment) {
    // navigate to the edit form for the selected equipment
    if (e && e.id != null) {
      this.router.navigate(['/trainer-sessions/equipments/edit', e.id]);
    }
  }
openDetails(e: Equipment) {

  this.selectedEquipment = e;

}


closeDetails() {

  this.selectedEquipment = null;

}


openReservations(equipmentId: number) {

  this.equipmentService
    .getReservations(equipmentId)
    .subscribe({

      next: (data) => {

        this.reservations = data;

        this.showReservationsModal = true;

      },

      error: (err) => {

        console.error(err);

          this.notify.error('Failed to load reservations');

      }

    });

}


closeReservations() {

  this.showReservationsModal = false;

}

getDurationHours(start?: string, end?: string): number {

  if (!start || !end) return 0;

  const startDate = new Date(start).getTime();
  const endDate = new Date(end).getTime();

  return Math.round((endDate - startDate) / 3600000);

}

}
