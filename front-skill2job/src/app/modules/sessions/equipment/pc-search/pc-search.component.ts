import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PcOffer } from '../../../models/pc-offer.model';
import { PcService } from '../../../services/pc.service';

@Component({
  selector: 'app-pc-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pc-search.component.html',
  styleUrls: ['./pc-search.component.css']
})
export class PcSearchComponent {

  offers: PcOffer[] = [];
  loading = false;
  showResults = false;

  maxPrice?: number;
  minRam?: number;

  constructor(private pcService: PcService) {}

  search(): void {

  // 🔥 clear old results immediately
  this.offers = [];

  this.loading = true;
  this.showResults = true;

  this.pcService.getOffers(this.maxPrice, this.minRam)
    .subscribe({
      next: (data) => {
        this.offers = data;   // replace with new filtered results
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
}

  closeModal(): void {
    this.showResults = false;
  }
}