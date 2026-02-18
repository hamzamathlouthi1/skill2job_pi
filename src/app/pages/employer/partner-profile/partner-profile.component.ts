import { Component, OnInit } from '@angular/core';
import { PartnerService } from '../../partners/services/partner.service';
import { Partner } from '../../partners/models/partner.model';

@Component({
  selector: 'app-partner-profile',
  templateUrl: './partner-profile.component.html',
  styleUrls: ['./partner-profile.component.scss']
})
export class PartnerProfileComponent implements OnInit {

  employerId = 1; // TODO: remplacer par auth

  partner: Partner | null = null;

  form: Partner = {
    companyName: '',
    industry: '',
    companyEmail: '',
    phone: '',
    address: '',
    website: '',
    description: ''
  };

  loading = false;
  msg = '';

  constructor(private partnerService: PartnerService) {}

  ngOnInit(): void {
    this.loadPartner();
  }

  loadPartner() {
    this.loading = true;
    this.msg = '';

    this.partnerService.getPartnerByEmployerId(this.employerId).subscribe({
      next: (p) => {
        this.partner = p;
        this.form = { ...p };
        this.loading = false;
      },
      error: () => {
        // partner non créé encore
        this.partner = null;
        this.loading = false;
      }
    });
  }

  save() {
    this.loading = true;
    this.msg = '';

    const call$ = this.partner
      ? this.partnerService.updatePartner(this.employerId, this.form)
      : this.partnerService.addPartner(this.employerId, this.form);

    call$.subscribe({
      next: (p) => {
        this.partner = p;
        this.form = { ...p };
        this.msg = 'Partner profile saved ✅';
        this.loading = false;
      },
      error: () => {
        this.msg = 'Save failed ❌';
        this.loading = false;
      }
    });
  }
  deleteMyPartner() {
  if (!confirm('Are you sure you want to delete your Partner Profile?')) return;

  this.loading = true;
  this.partnerService.deletePartnerByEmployerId(this.employerId).subscribe({
    next: () => {
      this.partner = null;
      this.msg = 'Partner profile deleted.';
      this.loading = false;
    },
    error: () => {
      this.msg = 'Delete failed.';
      this.loading = false;
    }
  });
}

}
