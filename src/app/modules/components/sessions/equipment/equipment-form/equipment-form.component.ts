import { Component, OnInit } from '@angular/core';
import { EquipmentService } from '../../../../services/equipment.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-equipment-form',
  templateUrl: './equipment-form.component.html',
  styleUrls: ['./equipment-form.component.scss']
})
export class EquipmentFormComponent implements OnInit {

  name = '';
  quantity = 0;
  selectedFile!: File;
  preview: string | ArrayBuffer | null = null;

  id!: number;
  isEdit = false;

  constructor(
    private equipmentService: EquipmentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // check if edit mode
    this.id = this.route.snapshot.params['id'];

    if (this.id) {
      this.isEdit = true;

      this.equipmentService.getById(this.id).subscribe(res => {
        this.name = res.name;
        this.quantity = res.quantity;

        if (res.photo) {
          this.preview =
            'http://localhost:8081/api/equipments/photo/' + res.photo;
        }
      });
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

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

  if (this.selectedFile) {
    formData.append('file', this.selectedFile);
  }

  // ADD
  if (!this.isEdit) {

    this.equipmentService.addWithPhoto(formData).subscribe({

      next: () => {

        console.log("Equipment created");

        // ✅ correct redirect
        this.router.navigate(['/admin/equipments']);

      },

      error: err => console.error(err)

    });

  }

  // EDIT
  else {

    this.equipmentService.updateWithPhoto(this.id, formData).subscribe({

      next: () => {

        console.log("Equipment updated");

        // ✅ correct redirect
        this.router.navigate(['/admin/equipments']);

      },

      error: err => console.error(err)

    });

  }

}
}
