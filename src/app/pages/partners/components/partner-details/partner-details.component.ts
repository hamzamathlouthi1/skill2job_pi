import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PartnerService } from '../../services/partner.service';
import { JobOfferService } from '../../services/job-offer.service';
import { Partner } from '../../models/partner.model';
import { JobOffer } from '../../models/job-offer.model';

@Component({
  selector: 'app-partner-details',
  templateUrl: './partner-details.component.html',
  styleUrls: ['./partner-details.component.scss']
})
export class PartnerDetailsComponent implements OnInit {

  partnerId!: number;

  partner: Partner | null = null;
  offers: JobOffer[] = [];

  loading = false;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private partnerService: PartnerService,
    private offerService: JobOfferService
  ) {}

  ngOnInit(): void {
    this.partnerId = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  load() {
    this.loading = true;
    this.message = '';

    // 1) Charger le partner
    this.partnerService.getPartnerById(this.partnerId).subscribe({
      next: (p) => {
        this.partner = p;

        // 2) Charger ses offres
        this.offerService.getOffersByPartnerId(this.partnerId).subscribe({
          next: (list) => {
            this.offers = list;
            this.loading = false;
          },
          error: () => {
            this.message = 'Cannot load offers.';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.message = 'Partner not found.';
        this.loading = false;
      }
    });
  }
}
