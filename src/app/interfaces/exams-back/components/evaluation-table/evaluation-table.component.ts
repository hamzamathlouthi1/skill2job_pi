import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamsService } from '../../services/exams.service';

@Component({
  selector: 'app-evaluation-table',
  templateUrl: './evaluation-table.component.html',
  styleUrls: ['./evaluation-table.component.scss']
})
export class EvaluationTableComponent implements OnInit {
  evaluations: any[] = [];
  examId: number | null = null;  // Add this
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examsService: ExamsService
  ) { }

  ngOnInit(): void {
    // Get examId from route if available
    this.examId = this.route.snapshot.params['examId'] ? +this.route.snapshot.params['examId'] : null;
    console.log('Exam ID from route:', this.examId); // Debug log
    this.loadEvaluations();
  }

  loadEvaluations(): void {
    this.loading = true;
    this.errorMessage = '';
    
    console.log('Loading evaluations...');
    
    // Use different methods based on whether examId exists
    const request = this.examId 
      ? this.examsService.getEvaluationsByExam(this.examId)
      : this.examsService.getAllEvaluations();
    
    request.subscribe({
      next: (data) => {
        console.log('Evaluations received:', data);
        this.evaluations = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading evaluations:', error);
        if (error.status === 0) {
          this.errorMessage = 'Cannot connect to backend. Is the server running?';
        } else if (error.status === 404) {
          this.errorMessage = 'API endpoint not found. Check the URL.';
        } else if (error.status === 500) {
          this.errorMessage = 'Server error. Check backend console.';
        } else {
          this.errorMessage = `Failed to load evaluations: ${error.message || 'Unknown error'}`;
        }
        this.loading = false;
      }
    });
  }

  // Add this method
  generateCertificate(evaluationId: number): void {
    console.log('Generating certificate for evaluation:', evaluationId);
    this.examsService.generateCertificate(evaluationId).subscribe({
      next: (certificate) => {
        console.log('Certificate generated:', certificate);
        // Refresh the list to show the new certificate
        this.loadEvaluations();
      },
      error: (error) => {
        console.error('Error generating certificate:', error);
        alert('Failed to generate certificate. It may already exist.');
      }
    });
  }

  // Add this method
  deleteEvaluation(id: number): void {
    if (confirm('Are you sure you want to delete this evaluation?')) {
      console.log('Deleting evaluation:', id);
      this.examsService.deleteEvaluation(id).subscribe({
        next: () => {
          console.log('Evaluation deleted successfully');
          this.loadEvaluations(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting evaluation:', error);
          alert('Failed to delete evaluation.');
        }
      });
    }
  }

  // Add this method
  viewCertificate(evaluationId: number): void {
    this.examsService.getCertificateByEvaluation(evaluationId).subscribe({
      next: (cert) => {
        if (cert) {
          // Navigate to certificate details
          this.router.navigate(['/admin/exams/certificates', cert.id]);
        } else {
          alert('No certificate found for this evaluation.');
        }
      },
      error: (error) => {
        console.error('Error fetching certificate:', error);
        alert('No certificate found for this evaluation.');
      }
    });
  }

  // Add refresh method
  refresh(): void {
    this.loadEvaluations();
  }
}