import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationService, ApplicationResponse } from '../../modules/services/application.service';

type AppStatus = 'ALL' | 'SENT' | 'SHORTLISTED' | 'INTERVIEW' | 'ACCEPTED' | 'REJECTED';

@Component({
  selector: 'app-my-applications',
  templateUrl: './my-applications.component.html',
  styleUrls: ['./my-applications.component.scss']
})
export class MyApplicationsComponent implements OnInit {

  apps: ApplicationResponse[] = [];
  filtered: ApplicationResponse[] = [];

  loading = false;
  error = '';
  success = '';

  // UI controls
  q = '';
  status: AppStatus = 'ALL';
  sort: 'NEWEST' | 'OLDEST' = 'NEWEST';

  constructor(
    private applicationService: ApplicationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.applicationService.myApplications().subscribe({
      next: (data) => {
        this.apps = data || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;

        if (err?.status === 401 || err?.status === 403) {
          this.error = "Access denied. Sign in as Learner.";
        } else if (err?.status === 0) {
          this.error = "Unable to contact the server.";
        } else {
          this.error = typeof err?.error === 'string'
            ? err.error
            : "Error loading applications.";
        }
      }
    });
  }

  applyFilters(): void {
    const query = (this.q || '').trim().toLowerCase();

    let list = [...this.apps];

    // Filter status
    if (this.status !== 'ALL') {
      list = list.filter(a => a.status === this.status);
    }

    // Search
    if (query) {
      list = list.filter(a =>
        (a.offerTitle || '').toLowerCase().includes(query) ||
        (a.partnerName || '').toLowerCase().includes(query) ||
        (a.location || '').toLowerCase().includes(query)
      );
    }

    // Sort by appliedAt
    list.sort((a, b) => {
      const da = new Date(a.appliedAt).getTime();
      const db = new Date(b.appliedAt).getTime();
      return this.sort === 'NEWEST' ? (db - da) : (da - db);
    });

    this.filtered = list;
  }

  badgeClass(status: string): string {
    switch (status) {
      case 'SENT': return 'sent';
      case 'SHORTLISTED': return 'shortlisted';
      case 'INTERVIEW': return 'interview';
      case 'ACCEPTED': return 'accepted';
      case 'REJECTED': return 'rejected';
      default: return '';
    }
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'SENT': return 'SENT';
      case 'SHORTLISTED': return 'SHORTLISTED';
      case 'INTERVIEW': return 'INTERVIEW';
      case 'ACCEPTED': return 'ACCEPTED';
      case 'REJECTED': return 'REJECTED';
      default: return status;
    }
  }

  openOffer(offerId: number): void {
    this.router.navigate(['/user/offers', offerId]);
  }

  joinMeet(url: string): void {
    const link = (url || '').trim();
    if (!link) return;
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  trackById(_: number, item: ApplicationResponse): number {
    return item.id;
  }
  scoreClass(score: number | null | undefined): string {
  const s = Number(score ?? 0);
  if (s >= 80) return 'high';
  if (s >= 60) return 'mid';
  if (s >= 40) return 'low';
  return 'verylow';
}

scoreLabel(score: number | null | undefined): string {
  const s = Number(score ?? 0);
  if (s >= 80) return 'Excellent match';
  if (s >= 60) return 'Good match';
  if (s >= 40) return 'Average match';
  return 'Weak match';
}
isTopCandidate(score: number | null | undefined): boolean {
  return Number(score ?? 0) >= 85;
}
}