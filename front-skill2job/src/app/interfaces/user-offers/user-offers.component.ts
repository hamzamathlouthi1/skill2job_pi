import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JobOfferService } from '../../modules/services/job-offer.service';
import { JobOffer } from '../../modules/models/job-offer.model';

@Component({
  selector: 'app-user-offers',
  templateUrl: './user-offers.component.html',
  styleUrls: ['./user-offers.component.scss']
})
export class UserOffersComponent implements OnInit {

  offers: JobOffer[] = [];
  filtered: JobOffer[] = [];

  loading = false;
  error = '';

  // filtres simples (optionnels)
  keyword = '';
  type: 'ALL' | 'INTERNSHIP' | 'JOB' = 'ALL';
  mode: 'ALL' | 'ONSITE' | 'REMOTE' | 'HYBRID' = 'ALL';

  constructor(
    private offerService: JobOfferService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.loading = true;
    this.error = '';

    this.offerService.getAllOffers().subscribe({
      next: (data) => {
        this.offers = (data || []).filter(o => o.status === 'OPEN'); // optionnel
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.error = "Erreur lors du chargement des offres.";
      }
    });
  }

  applyFilters(): void {
    const k = this.keyword.trim().toLowerCase();

    this.filtered = this.offers.filter(o => {
      const okKeyword =
        !k ||
        (o.title || '').toLowerCase().includes(k) ||
        (o.location || '').toLowerCase().includes(k);

      const okType = this.type === 'ALL' || o.type === this.type;
      const okMode = this.mode === 'ALL' || o.mode === this.mode;

      return okKeyword && okType && okMode;
    });
  }

  // ✅ IMPORTANT : accepte undefined et bloque si pas d'id
  openDetails(id: number | undefined): void {
    if (!id) return;
    this.router.navigate(['/user/offers', id]);
  }

  trackById(_: number, o: JobOffer): number {
    return o.id ?? 0;
  }
}