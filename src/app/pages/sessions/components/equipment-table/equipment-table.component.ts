import { Component, OnInit } from '@angular/core';
import { EquipmentService } from '../../services/equipment.service';
import { Equipment } from '../../models/equipment.model';

@Component({
  selector: 'app-equipment-table',
  templateUrl: './equipment-table.component.html',
  styleUrls: ['./equipment-table.component.scss']
})
export class EquipmentTableComponent implements OnInit {

  equipments: Equipment[] = [];

  constructor(private equipmentService: EquipmentService) {}

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
  deleteEquipment(id: number) {
  if (confirm('Delete this equipment?')) {
    this.equipmentService.deleteEquipment(id).subscribe(() => {
      this.equipments = this.equipments.filter(e => e.id !== id);
    });
  }
}

}
