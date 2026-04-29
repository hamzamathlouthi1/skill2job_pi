import { Component } from '@angular/core';
import { PcOffer } from '../../../models/pc-offer.model';
import { PcService } from '../../../../../app/modules/services/pc.service';

@Component({
  selector: 'app-pc-search',
  templateUrl: './pc-search.component.html',
  styleUrls: ['./pc-search.component.css']
})
export class PcSearchComponent {

  offers: PcOffer[] = [];
  loading = false;
  showResults = false;
  errorMessage = '';
  statusMessage = '';

  maxPrice?: number;
  minRam?: number;

  constructor(private pcService: PcService) { }

  search(): void {
    // Validation
    if (this.maxPrice !== undefined && this.maxPrice !== null && this.maxPrice < 0) {
      this.errorMessage = 'Please enter a valid price';
      return;
    }

    // Clear previous state
    this.offers = [];
    this.errorMessage = '';
    this.statusMessage = '';
    this.loading = true;
    this.showResults = true;

    console.log('Starting PC search with filters:', { maxPrice: this.maxPrice, minRam: this.minRam });
    this.statusMessage = 'Searching for laptops... This may take a moment.';

    this.pcService.getOffers(this.maxPrice, this.minRam)
      .subscribe({
        next: (data) => {
          console.log('Search successful, found:', data.length, 'offers');
          this.offers = data;
          this.loading = false;
          this.statusMessage = '';

          if (data.length === 0) {
            this.statusMessage = 'No laptops found matching your criteria.';
          }
        },
        error: (err) => {
          console.error('PC search error:', err);
          this.loading = false;

          // Parse error message
          let errorMsg = 'An error occurred while fetching laptops. Please try again.';

          if (err.error) {
            if (typeof err.error === 'string') {
              errorMsg = err.error;
            } else if (err.error.error) {
              errorMsg = err.error.error;
            }
          }

          if (err.status === 0) {
            errorMsg = 'Cannot connect to server. Make sure the backend is running.';
          } else if (err.status === 500) {
            errorMsg = 'Server error: ' + (err.error.error || 'Scraping failed');
          } else if (err.status === 503) {
            errorMsg = 'Server temporarily unavailable. Please try again later.';
          }

          this.errorMessage = errorMsg;
          this.statusMessage = '';
        }
      });
  }

  closeModal(): void {
    this.showResults = false;
    this.errorMessage = '';
    this.statusMessage = '';
  }
}