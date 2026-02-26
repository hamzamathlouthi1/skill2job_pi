import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';  
import { Certificate, Exam, Evaluation } from '../../models/exam';
import { forkJoin } from 'rxjs';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-certificate-list',
  templateUrl: './certificate-list.component.html',
  styleUrls: ['./certificate-list.component.scss']
})
export class CertificateListComponent implements OnInit {
  certificates: Certificate[] = [];
  exams: Map<number, Exam> = new Map();
  evaluations: Evaluation[] = [];
  evaluationByCertificateId: Map<number, Evaluation> = new Map();
  evaluationById: Map<number, Evaluation> = new Map();
  evaluationByCertificateCode: Map<string, Evaluation> = new Map();
  loading = true;
  error: string | null = null;

  constructor(
    private examService: ExamService,
    private authService: AuthService,  
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.loading = true;
    const user = this.authService.getCurrentUser();  // ✅ Using authService
    
    if (!user) {
      this.router.navigate(['/signin']);  // ✅ Changed from '/auth/login' to '/signin'
      return;
    }

    // Get user ID from the user object - handle different possible structures safely
    const userAny = user as any;
    let userId = userAny.id || userAny.userId;

    if (!userId) {
      console.warn('No valid user ID found in auth data. Falling back to userId = 1.', user);
      userId = 1;
    }
    
    forkJoin({
      exams: this.examService.getAllExams(),
      evaluations: this.examService.getUserEvaluations(userId),
      certificates: this.examService.getUserCertificates(userId)
    }).subscribe({
      next: (result) => {
        console.log('Exams loaded:', result.exams);
        console.log('Evaluations loaded:', result.evaluations);
        console.log('Certificates loaded:', result.certificates);
        
        // Store exams in map
        result.exams.forEach(exam => {
          this.exams.set(exam.id, exam);
        });

        // Store evaluations and index by certificate ID, certificate code, and evaluation ID
        this.evaluations = result.evaluations || [];
        this.evaluationByCertificateId.clear();
        this.evaluationById.clear();
        this.evaluationByCertificateCode.clear();
        this.evaluations.forEach((evaluation: any) => {
          if (evaluation.certificate && evaluation.certificate.id) {
            this.evaluationByCertificateId.set(evaluation.certificate.id, evaluation);
          }
          if (evaluation.certificate && evaluation.certificate.certificateCode) {
            this.evaluationByCertificateCode.set(evaluation.certificate.certificateCode, evaluation);
          }
          if (evaluation.id != null) {
            this.evaluationById.set(evaluation.id, evaluation);
          }
        });

        // Also link certificates to exams by certificate.evaluation.id (backend shape)
        (result.certificates || []).forEach((cert: any) => {
          const evId = cert.evaluation?.id ?? cert.evaluationId;
          if (evId != null && this.evaluationById.has(evId)) {
            const ev = this.evaluationById.get(evId)!;
            this.evaluationByCertificateId.set(cert.id ?? evId, ev);
            if (cert.certificateCode) {
              this.evaluationByCertificateCode.set(cert.certificateCode, ev);
            }
          }
        });

        // Store certificates
        this.certificates = result.certificates;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.error = 'Failed to load certificates';
        this.loading = false;
      }
    });
  }

  getExamTitle(cert: Certificate): string {
    const anyCert = cert as any;
    const evaluation = this.getEvaluationForCertificate(cert);
    if (evaluation) {
      const exam = this.exams.get(evaluation.examId);
      if (exam) return exam.title;
    }
    if (anyCert.exam && anyCert.exam.title) return anyCert.exam.title;
    const examId: number | undefined = cert.examId ?? anyCert.examId ?? anyCert.exam?.id;
    if (!examId) return 'Unknown Exam';
    const exam = this.exams.get(examId);
    if (!exam) {
      this.fetchExamDetails(examId);
      return 'Loading...';
    }
    return exam.title;
  }

  /** Get evaluation linked to this certificate (by cert.id, cert.evaluation.id, or cert.certificateCode). */
  getEvaluationForCertificate(cert: Certificate): Evaluation | null {
    const anyCert = cert as any;
    if (cert.id != null && this.evaluationByCertificateId.has(cert.id)) {
      return this.evaluationByCertificateId.get(cert.id)!;
    }
    const evId = anyCert.evaluation?.id ?? anyCert.evaluationId;
    if (evId != null && this.evaluationById.has(evId)) {
      return this.evaluationById.get(evId)!;
    }
    if (cert.certificateCode && this.evaluationByCertificateCode.has(cert.certificateCode)) {
      return this.evaluationByCertificateCode.get(cert.certificateCode)!;
    }
    return null;
  }

  getExamForCertificate(cert: Certificate): Exam | null {
    const evaluation = this.getEvaluationForCertificate(cert);
    if (evaluation) return this.exams.get(evaluation.examId) ?? null;
    const anyCert = cert as any;
    if (anyCert.exam && anyCert.exam.title) return anyCert.exam;
    const examId: number | undefined = cert.examId ?? anyCert.examId ?? anyCert.exam?.id;
    if (examId != null) return this.exams.get(examId) ?? null;
    return null;
  }

  getExamPassScore(cert: Certificate): number {
    const evaluation = this.getEvaluationForCertificate(cert);
    if (evaluation) {
      const exam = this.exams.get(evaluation.examId);
      if (exam && typeof exam.passScore === 'number') return exam.passScore;
    }
    const anyCert = cert as any;
    if (anyCert.exam && typeof anyCert.exam.passScore === 'number') return anyCert.exam.passScore;
    const examId: number | undefined = cert.examId ?? anyCert.examId ?? anyCert.exam?.id;
    if (examId == null) return 0;
    const exam = this.exams.get(examId);
    return exam ? exam.passScore : 0;
  }

  fetchExamDetails(examId: number): void {
    this.examService.getExamById(examId).subscribe({
      next: (exam) => {
        this.exams.set(examId, exam);
      },
      error: (err) => console.error('Error fetching exam details:', err)
    });
  }

  viewCertificate(certificate: Certificate): void {
    const exam = this.getExamForCertificate(certificate);
    const id = certificate.id ?? (certificate as any).certificateCode;
    this.router.navigate(['/user/certificates', id], {
      state: { certificate: certificate, exam: exam ?? undefined }
    });
  }

  downloadCertificate(certificate: Certificate): void {
    const examTitle = this.getExamTitle(certificate);
    const passScore = this.getExamPassScore(certificate);

    const doc = new jsPDF('landscape', 'pt', 'a4');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Border
    doc.setDrawColor(183, 28, 28);
    doc.setLineWidth(4);
    doc.rect(30, 30, pageWidth - 60, pageHeight - 60);

    // Title
    doc.setTextColor(183, 28, 28);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE OF ACHIEVEMENT', pageWidth / 2, 90, { align: 'center' });

    // Exam title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text((examTitle || 'Unknown Exam').toUpperCase(), pageWidth / 2, 140, { align: 'center' });

    // Student section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('This is to certify that', pageWidth / 2, 190, { align: 'center' });

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(183, 28, 28);
    doc.text(`Student ID: ${certificate.userId}`, pageWidth / 2, 220, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('has successfully completed the exam', pageWidth / 2, 250, { align: 'center' });

    // Details
    doc.setFontSize(12);
    doc.setTextColor(220, 220, 220);
    doc.text(`Passing Score Required: ${passScore}%`, pageWidth / 2, 290, { align: 'center' });

    // Certificate code box
    doc.setDrawColor(183, 28, 28);
    doc.setLineWidth(1.5);
    doc.rect(pageWidth / 2 - 180, 320, 360, 50);
    doc.setFontSize(14);
    doc.setTextColor(183, 28, 28);
    doc.setFont('helvetica', 'bold');
    doc.text(certificate.certificateCode, pageWidth / 2, 350, { align: 'center' });

    // Issue date
    doc.setFontSize(12);
    doc.setTextColor(200, 200, 200);
    doc.setFont('helvetica', 'normal');
    doc.text(`Issue Date: ${this.formatDate(certificate.issueDate)}`, pageWidth / 2, 390, { align: 'center' });

    // Signature / SKILL2JOB
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('SKILL2JOB', pageWidth - 150, pageHeight - 90, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(180, 180, 180);
    doc.setFont('helvetica', 'normal');
    doc.text(`${new Date().getFullYear()}`, pageWidth - 150, pageHeight - 70, { align: 'center' });

    // Simple signature line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 230, pageHeight - 110, pageWidth - 70, pageHeight - 110);

    doc.save(`certificate-${certificate.certificateCode}.pdf`);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goToExams(): void {
    this.router.navigate(['/user/exams']);  // ✅ Changed from '/exams' to '/user/exams'
  }
}