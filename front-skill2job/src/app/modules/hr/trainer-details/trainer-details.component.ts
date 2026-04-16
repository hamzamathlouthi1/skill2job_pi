import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-trainer-details',
  templateUrl: './trainer-details.component.html',
  styleUrls: ['./trainer-details.component.scss']
})
export class TrainerDetailsComponent implements OnInit {

  details: any[] = [];
  loading = false;
  error: string | null = null;

  private baseUrl = 'http://localhost:8090/api/admin/trainer-details';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadDetails();
  }

  loadDetails(): void {
    this.loading = true;
    this.error = null;
    
    this.http.get<any[]>(this.baseUrl).subscribe({
      next: (data) => {
        this.details = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load trainer details';
        this.loading = false;
        console.error('Error loading details:', err);
      }
    });
  }

  deleteDetail(id: number): void {
    if (!confirm('Are you sure you want to delete these trainer details?')) return;
    
    this.http.delete(`${this.baseUrl}/${id}`).subscribe({
      next: () => {
        this.details = this.details.filter(d => d.id !== id);
      },
      error: (err) => {
        alert('Failed to delete trainer details');
        console.error('Error deleting detail:', err);
      }
    });
  }

  viewDetail(detail: any): void {
    console.log('View detail:', detail);
  }
}
