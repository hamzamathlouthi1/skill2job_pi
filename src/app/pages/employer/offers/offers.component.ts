import { Component, OnInit } from '@angular/core';
import { PartnerService } from '../../partners/services/partner.service';
import { JobOfferService } from '../../partners/services/job-offer.service';
import { Partner } from '../../partners/models/partner.model';
import { JobOffer } from '../../partners/models/job-offer.model';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss']
})
export class OffersComponent implements OnInit {

  employerId = 1; // TODO: remplacer par Auth plus tard

  partner: Partner | null = null;
  offers: JobOffer[] = [];

  loading = false;
  msg = '';

  editingId: number | null = null;

  // form en "any" car ton JobOffer model n'a peut-être pas tous les champs
  form: any = {
    title: '',
    description: '',
    location: '',
    type: 'INTERNSHIP',   // ✅ obligatoire pour Spring
    mode: 'ONSITE',       // ✅ obligatoire pour Spring
    requirements: '',
    deadline: '',
    status: 'OPEN'
  };

  constructor(
    private partnerService: PartnerService,
    private offerService: JobOfferService
  ) {}

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.loading = true;
    this.msg = '';

    this.partnerService.getPartnerByEmployerId(this.employerId).subscribe({
      next: (p: Partner) => {
        this.partner = p;
        this.loadOffers();
      },
      error: () => {
        this.msg = 'Create your Partner Profile first.';
        this.loading = false;
      }
    });
  }

  loadOffers(): void {
    if (!this.partner?.id) return;

    this.offerService.getOffersByPartnerId(this.partner.id).subscribe({
      next: (list: JobOffer[]) => {
        this.offers = list;
        this.loading = false;
      },
      error: () => {
        this.msg = 'Cannot load offers.';
        this.loading = false;
      }
    });
  }

  submit(): void {
    if (!this.partner?.id) {
      this.msg = 'Partner not found.';
      return;
    }

    this.loading = true;
    this.msg = '';

    // Payload EXACT selon ton JobOfferCreateRequest
    const payload = {
      partnerId: this.partner.id,
      title: this.form.title,
      description: this.form.description,
      location: this.form.location,
      type: this.form.type,             // INTERNSHIP / JOB
      mode: this.form.mode,             // ONSITE / REMOTE / HYBRID
      requirements: this.form.requirements,
      deadline: this.form.deadline      // yyyy-MM-dd
    };

    if (this.editingId) {
      this.offerService.updateOffer(this.editingId, payload).subscribe({
        next: () => {
          this.resetForm();
          this.loadOffers();
        },
        error: () => {
          this.msg = 'Update failed.';
          this.loading = false;
        }
      });
    } else {
      this.offerService.addOffer(payload).subscribe({
        next: () => {
          this.resetForm();
          this.loadOffers();
        },
        error: () => {
          this.msg = 'Create failed.';
          this.loading = false;
        }
      });
    }
  }

  edit(o: JobOffer): void {
    this.editingId = o.id ?? null;
    this.form = {
      title: (o as any).title ?? '',
      description: (o as any).description ?? '',
      location: (o as any).location ?? '',
      type: (o as any).type ?? 'INTERNSHIP',
      mode: (o as any).mode ?? 'ONSITE',
      requirements: (o as any).requirements ?? '',
      deadline: (o as any).deadline ?? '',
      status: (o as any).status ?? 'OPEN'
    };
  }

  remove(id?: number): void {
    if (!id) return;

    this.loading = true;
    this.offerService.deleteOffer(id).subscribe({
      next: () => this.loadOffers(),
      error: () => {
        this.msg = 'Delete failed.';
        this.loading = false;
      }
    });
  }

  closeOffer(id?: number): void {
    if (!id) return;

    this.loading = true;
    this.offerService.updateOfferStatus(id, 'CLOSED').subscribe({
      next: () => this.loadOffers(),
      error: () => {
        this.msg = 'Close failed.';
        this.loading = false;
      }
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form = {
      title: '',
      description: '',
      location: '',
      type: 'INTERNSHIP',
      mode: 'ONSITE',
      requirements: '',
      deadline: '',
      status: 'OPEN'
    };
  }
  toggleStatus(o: JobOffer) {
  if (!o.id) return;

  const newStatus = o.status === 'CLOSED' ? 'OPEN' : 'CLOSED';

  this.loading = true;

  this.offerService.updateOfferStatus(o.id, newStatus).subscribe({
    next: () => this.loadOffers(),
    error: () => {
      this.msg = 'Status update failed.';
      this.loading = false;
    }
  });
}
}
