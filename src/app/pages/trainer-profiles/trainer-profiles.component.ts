import { Component, OnInit } from '@angular/core';
import { TrainerProfileService } from './services/trainer-profile.service';

@Component({
  selector: 'app-trainer-profiles',
  templateUrl: './trainer-profiles.component.html',
  styleUrls: ['./trainer-profiles.component.scss']
})
export class TrainerProfilesComponent implements OnInit {

  profiles: any[] = [];

  constructor(private service: TrainerProfileService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.service.getAll().subscribe({
      next: (data) => this.profiles = data,
      error: (err) => console.error(err)
    });
  }

  changeStatus(id: number, status: string) {
    this.service.changeStatus(id, status).subscribe(() => this.load());
  }

  delete(id: number) {
    if (!confirm('Delete this profile?')) return;
    this.service.delete(id).subscribe(() => this.load());
  }
}
