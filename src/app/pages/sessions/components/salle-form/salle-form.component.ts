import { Component, OnInit } from '@angular/core';
import { SalleService } from '../../services/salle.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Salle } from '../../models/salle';

@Component({
  selector: 'app-salle-form',
  templateUrl: './salle-form.component.html',
   styleUrls: ['./salle-form.component.scss']
})
export class SalleFormComponent implements OnInit {

  salle: Salle = {
    name: '',
    capacity: 0,
    status: 'available'
  };

  isEdit = false;

  constructor(
    private salleService: SalleService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];

    if (id) {
      this.isEdit = true;
      this.salleService.getById(id).subscribe(data => {
        this.salle = data;
      });
    }
  }

  save() {
    if (this.isEdit) {
      this.salleService.update(this.salle.id!, this.salle)
        .subscribe(() => this.router.navigate(['/sessions/salles']));
    } else {
      this.salleService.add(this.salle)
        .subscribe(() => this.router.navigate(['/sessions/salles']));
    }
  }
}
