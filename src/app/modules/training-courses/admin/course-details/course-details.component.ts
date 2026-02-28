import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TrainingCourseService } from '../../services/training-course.service';

@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.css']
})
export class CourseDetailsComponent implements OnInit {
  course: any;
  pdfUrls: SafeResourceUrl[] = [];
  rawPdfUrls: string[] = []; // ✅ URLs brutes pour le bouton Download
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: TrainingCourseService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.service.getAll().subscribe({
      next: (courses: any[]) => {
        this.course = courses.find((c: any) => c.id === id);

        if (!this.course) {
          this.error = 'Course not found.';
          this.loading = false;
          return;
        }

        if (this.course.pdfUrls && this.course.pdfUrls.length > 0) {
          this.course.pdfUrls.forEach((pdf: string) => {
            const fullUrl = pdf.startsWith('http')
              ? pdf
              : 'http://localhost:8089' + (pdf.startsWith('/') ? '' : '/') + pdf;

            this.rawPdfUrls.push(fullUrl); // ✅ pour Download
            this.pdfUrls.push(this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl)); // ✅ pour iframe
          });
        }

        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load course';
        this.loading = false;
      }
    });
  }

  // ✅ Retourne l'URL brute pour le bouton Download
  getRawUrl(index: number): string {
    return this.rawPdfUrls[index];
  }

  goBack() {
    this.router.navigate(['/admin/training-courses']);
  }
}