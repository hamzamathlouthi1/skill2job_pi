import { Component, OnInit } from '@angular/core';
import { ExamsService } from '../../services/exams.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-certificate-list',
  templateUrl: './certificate-list.component.html',
  styleUrls: ['./certificate-list.component.scss']
})
export class CertificateListComponent implements OnInit {
  certificates: any[] = [];
  loading = false;

  constructor(
    private examsService: ExamsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.loading = true;
    this.examsService.getAllCertificates().subscribe({
      next: (data) => {
        this.certificates = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading certificates:', error);
        this.loading = false;
      }
    });
  }

  deleteCertificate(id: number): void {
    if (confirm('Are you sure you want to delete this certificate?')) {
      this.examsService.deleteCertificate(id).subscribe({
        next: () => {
          this.loadCertificates();
        },
        error: (error) => {
          console.error('Error deleting certificate:', error);
        }
      });
    }
  }

  testCreateCertificate(): void {
    // This is just for testing - you'll need a real evaluationId
    alert('Please create an evaluation in Postman first, then use the Generate button');
    this.router.navigate(['/admin/exams/certificates/generate']);
  }
}