import { Component } from '@angular/core';
import { EquipmentService } from '../../services/equipment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-equipment-form',
  templateUrl: './equipment-form.component.html',
  styleUrls: ['./equipment-form.component.scss']
})
export class EquipmentFormComponent {

  name = '';
  quantity = 0;
  selectedFile!: File;
  preview: string | ArrayBuffer | null = null;

  constructor(
    private equipmentService: EquipmentService,
    private router: Router
  ) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    // Image preview
    const reader = new FileReader();
    reader.onload = () => {
      this.preview = reader.result;
    };
    reader.readAsDataURL(this.selectedFile);
  }

  submit() {
    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('quantity', this.quantity.toString());
    formData.append('file', this.selectedFile);

    this.equipmentService.addWithPhoto(formData).subscribe(() => {
      this.router.navigate(['/sessions/equipments']);
    });
  }
}
