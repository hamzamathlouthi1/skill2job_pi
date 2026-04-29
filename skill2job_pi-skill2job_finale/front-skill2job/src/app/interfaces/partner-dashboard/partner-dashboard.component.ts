import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PartnerDashboardService, PartnerDashboardResponse } from '../../modules/services/partner-dashboard.service';

@Component({
  selector: 'app-partner-dashboard',
  templateUrl: './partner-dashboard.component.html',
  styleUrls: ['./partner-dashboard.component.scss']
})
export class PartnerDashboardComponent implements OnInit {

  data: PartnerDashboardResponse | null = null;
  loading = false;
  error = '';

  constructor(
    private dashboardService: PartnerDashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.dashboardService.getDashboard().subscribe({
      next: (d) => {
        // ✅ safety defaults (avoid undefined in template)
        this.data = {
          ...d,
          topCandidates: d.topCandidates || [],
          recentApplications: d.recentApplications || [],
          upcomingInterviews: d.upcomingInterviews || [],
          topOffers: d.topOffers || [],
          applicationsByStatus: d.applicationsByStatus || {}
        };
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.error = "Unable to load dashboard.";
      }
    });
  }

  // Quick navigation
  openOfferApps(offerId: number): void {
    this.router.navigate(['/partner/offers', offerId, 'applications']);
  }

  openOffer(offerId: number): void {
    this.router.navigate(['/partner/offers', offerId]);
  }

  openMeet(url?: string | null): void {
    const link = (url || '').trim();
    if (!link) return;
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  // For visual bars
  getStatusValue(key: string): number {
    return this.data?.applicationsByStatus?.[key] ?? 0;
  }

  maxStatusValue(): number {
    const map = this.data?.applicationsByStatus || {};
    const values = Object.values(map);
    return values.length ? Math.max(...values) : 1;
  }

  widthPercent(value: number): string {
    const max = this.maxStatusValue();
    const p = Math.round((value / max) * 100);
    return `${Math.max(6, p)}%`;
  }

  // ✅ Score helpers
  scoreClass(score: number | null | undefined): string {
    const s = Number(score ?? 0);
    if (s >= 80) return 'high';
    if (s >= 60) return 'mid';
    if (s >= 40) return 'low';
    return 'verylow';
  }

  isTopCandidate(score: number | null | undefined): boolean {
    return Number(score ?? 0) >= 85;
  }

  // ✅ Auto-shortlisted = status SHORTLISTED and score >=  threshold used in backend
  // (Here we simply detect "SHORTLISTED + score>=threshold". Keep threshold same as backend)
  isAutoShortlisted(status: string | null | undefined, score: number | null | undefined): boolean {
    const st = (status || '').toUpperCase();
    const s = Number(score ?? 0);
    return st === 'SHORTLISTED' && s >= 70; // 🔁 change 70 if your backend threshold is different
  }
}