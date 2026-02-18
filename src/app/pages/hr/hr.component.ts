import { Component, OnInit } from '@angular/core';
import { HrService } from './services/hr.service';

@Component({
  selector: 'app-hr',
  templateUrl: './hr.component.html',
  styleUrls: ['./hr.component.scss']
})
export class HrComponent implements OnInit {

  applications: any[] = [];
  selectedStatus: string = ''; // ALL by default

  constructor(private hrService: HrService) {}

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications() {
    const status = this.selectedStatus?.trim();

    this.hrService.getAllApplications(status ? status : undefined).subscribe({
      next: (data: any[]) => {
        this.applications = data;
        console.log('Applications:', data);
      },
      error: (err: any) => {
        console.error(err);
        alert('Error loading applications (check backend + CORS).');
      }
    });
  }

  // ✅ 1) Analyze (IA mock) => generate TrainerDetails
  analyze(id: number) {
    this.hrService.analyzeApplication(id).subscribe({
      next: () => {
        alert('AI analysis done! TrainerDetails generated.');
        this.loadApplications();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error analyzing application');
      }
    });
  }

  // ✅ 2) Approve => decision ACCEPT (creates TrainerProfile automatically)
  approve(id: number) {
    this.hrService.decide(id, 'ACCEPT').subscribe({
      next: () => {
        alert('Approved! TrainerProfile created automatically.');
        this.loadApplications();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error approving application');
      }
    });
  }

  // ✅ 3) Reject => decision REJECT
  reject(id: number) {
    this.hrService.decide(id, 'REJECT').subscribe({
      next: () => {
        alert('Rejected.');
        this.loadApplications();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error rejecting application');
      }
    });
  }

  deleteApplication(id: number) {
    if (!confirm('Delete this application?')) return;

    this.hrService.deleteApplication(id).subscribe({
      next: () => {
        alert('Application deleted!');
        this.loadApplications();
      },
      error: (err: any) => {
        console.error(err);
        alert('Error deleting application');
      }
    });
  }
}
