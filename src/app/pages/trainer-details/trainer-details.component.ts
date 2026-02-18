import { Component, OnInit } from '@angular/core';
import { TrainerDetailsService } from './services/trainer-details.service';

@Component({
  selector: 'app-trainer-details',
  templateUrl: './trainer-details.component.html',
  styleUrls: ['./trainer-details.component.scss']
})
export class TrainerDetailsComponent implements OnInit {

  details: any[] = [];
  search = '';

  constructor(private service: TrainerDetailsService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.service.getAll().subscribe({
      next: (data) => this.details = data || [],
      error: (err) => console.error(err)
    });
  }

  get filteredDetails(): any[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.details;

    return this.details.filter(d => {
      const appId = String(d.application?.id ?? '');
      const level = String(d.level ?? '').toLowerCase();
      const skills = String(d.skills ?? '').toLowerCase();
      const summary = String(d.aiSummary ?? '').toLowerCase();
      return appId.includes(q) || level.includes(q) || skills.includes(q) || summary.includes(q);
    });
  }

  splitSkills(skills: string): string[] {
    if (!skills) return [];
    return skills.split(',').map(s => s.trim()).filter(Boolean);
  }

  delete(id: number) {
    if (!confirm('Delete this details?')) return;
    this.service.delete(id).subscribe(() => this.load());
  }
}
