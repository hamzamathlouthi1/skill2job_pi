import { Component, OnInit } from '@angular/core';
import { TrainerProfileService } from './services/trainer-profile.service';

type ProfileStatus = 'ACTIVE' | 'SUSPENDED';
type Level = 'JUNIOR' | 'MID' | 'SENIOR' | string;

@Component({
  selector: 'app-trainer-profiles',
  templateUrl: './trainer-profiles.component.html',
  styleUrls: ['./trainer-profiles.component.scss']
})
export class TrainerProfilesComponent implements OnInit {

  profiles: any[] = [];
  filteredProfiles: any[] = [];

  // UI state
  loading = false;
  search = '';
  selectedStatus: '' | ProfileStatus = '';
  selectedLevel: '' | Level = '';

  // modal
  selectedProfile: any | null = null;
  isModalOpen = false;

  constructor(private service: TrainerProfileService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (data) => {
        this.profiles = data || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.loading = false;
        alert('Error loading trainer profiles');
      }
    });
  }

  applyFilters() {
    const q = (this.search || '').toLowerCase().trim();

    this.filteredProfiles = (this.profiles || []).filter(p => {
      const matchesSearch =
        !q ||
        String(p?.id ?? '').includes(q) ||
        String(p?.userId ?? '').includes(q) ||
        String(p?.mainSpeciality ?? '').toLowerCase().includes(q) ||
        String(p?.level ?? '').toLowerCase().includes(q) ||
        String(p?.status ?? '').toLowerCase().includes(q);

      const matchesStatus = !this.selectedStatus || p?.status === this.selectedStatus;
      const matchesLevel = !this.selectedLevel || p?.level === this.selectedLevel;

      return matchesSearch && matchesStatus && matchesLevel;
    });
  }

  // stats
  get totalCount(): number {
    return this.profiles?.length || 0;
  }
  get activeCount(): number {
    return (this.profiles || []).filter(p => p?.status === 'ACTIVE').length;
  }
  get suspendedCount(): number {
    return (this.profiles || []).filter(p => p?.status === 'SUSPENDED').length;
  }

  // actions
  changeStatus(id: number, status: ProfileStatus) {
    this.service.changeStatus(id, status).subscribe({
      next: () => this.load(),
      error: (err: any) => {
        console.error(err);
        alert('Error updating status');
      }
    });
  }

  delete(id: number) {
    if (!confirm('Delete this profile?')) return;
    this.service.delete(id).subscribe({
      next: () => this.load(),
      error: (err: any) => {
        console.error(err);
        alert('Error deleting profile');
      }
    });
  }

  // modal
  openProfile(p: any) {
    this.selectedProfile = p;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedProfile = null;
  }
}
