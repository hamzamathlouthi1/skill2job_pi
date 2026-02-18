import { Component, OnInit } from '@angular/core';
import { Partner } from './models/partner.model';
import { PartnerService } from './services/partner.service';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrls: ['./partners.component.scss']
})
export class PartnersComponent implements OnInit {

  partners: Partner[] = [];
  loading = false;
  message = '';

  constructor(private partnerService: PartnerService) {}

  ngOnInit(): void {
    this.loadPartners();
  }

  loadPartners() {
    this.loading = true;
    this.message = '';

    this.partnerService.getAllPartners().subscribe({
      next: (list) => {
        this.partners = list;
        this.loading = false;
      },
      error: () => {
        this.message = 'Cannot load partners ❌';
        this.loading = false;
      }
    });
  }

  changeStatus(partnerId: number, status: string) {
    this.partnerService.updatePartnerStatus(partnerId, status).subscribe({
      next: () => {
        this.message = `Status updated to ${status} ✅`;
        this.loadPartners();
      },
      error: () => this.message = 'Status update failed ❌'
    });
  }
  deletePartner(id?: number) {
  if (!id) return;
  if (!confirm('Delete this partner?')) return;

  this.loading = true;
  this.partnerService.deletePartnerById(id).subscribe({
    next: () => this.loadPartners(),
    error: () => {
      this.message = 'Delete failed.';
      this.loading = false;
    }
  });
}

}
