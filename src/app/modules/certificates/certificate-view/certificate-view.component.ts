import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { Certificate, Exam, Evaluation, Question, Answer } from '../../models/exam';
import jsPDF from 'jspdf';

export interface QuestionResult {
  question: Question;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
}

@Component({
  selector: 'app-certificate-view',
  templateUrl: './certificate-view.component.html',
  styleUrls: ['./certificate-view.component.scss']
})
export class CertificateViewComponent implements OnInit {
  certificate: Certificate | null = null;
  exam: Exam | null = null;
  evaluation: Evaluation | null = null;        // ← was missing
  questions: Question[] = [];                  // ← was missing
  questionResults: QuestionResult[] = [];      // ← was missing
  loading = true;
  error: string | null = null;
  currentYear = new Date().getFullYear();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCertificateData();
  }

  private loadCertificateData(): void {
    const state = history.state as { certificate?: Certificate; exam?: Exam };

    if (state?.certificate) {
      this.certificate = state.certificate;
      if (state.exam) {
        this.exam = state.exam;
        this.loadQuestionsAndEvaluation(state.exam.id);
        return;
      }
      this.loadExamDetailsFromCertificate(state.certificate);
      return;
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    const certificateId = idParam ? Number(idParam) : null;

    if (!certificateId || isNaN(certificateId)) {
      this.error = 'Invalid certificate ID.';
      this.loading = false;
      return;
    }

    this.examService.getCertificateById(certificateId).subscribe({
      next: (cert) => {
        this.certificate = cert;
        this.loadExamDetailsFromCertificate(cert);
      },
      error: () => {
        this.error = 'Failed to load certificate.';
        this.loading = false;
      }
    });
  }

  private loadExamDetailsFromCertificate(cert: Certificate): void {
    const anyCert = cert as any;
    const examId: number | undefined =
      cert.examId ?? anyCert.examId ?? anyCert.exam?.id;

    if (!examId) {
      this.resolveExamFromEvaluations(cert);
      return;
    }

    this.loadExamAndQuestions(examId);
  }

  private resolveExamFromEvaluations(cert: Certificate): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.error = 'Failed to load exam details.';
      this.loading = false;
      return;
    }

    const userAny = user as any;
    const userId = userAny.id ?? userAny.userId ?? 1;

    this.examService.getUserEvaluations(userId).subscribe({
      next: (evaluations: Evaluation[]) => {
        const match = evaluations.find((ev: any) =>
          ev.certificate?.id === cert.id ||
          ev.certificate?.certificateCode === cert.certificateCode
        );

        if (match?.examId) {
          this.evaluation = match;
          this.loadExamAndQuestions(match.examId);
        } else {
          this.error = 'Failed to load exam details.';
          this.loading = false;
        }
      },
      error: () => {
        this.error = 'Failed to load exam details.';
        this.loading = false;
      }
    });
  }

  private loadExamAndQuestions(examId: number): void {
    this.examService.getExamWithQuestions(examId).subscribe({
      next: (data) => {
        this.exam = data.exam;
        this.questions = data.questions || [];
        this.loadEvaluationAndBuildResults(examId);
      },
      error: () => {
        this.error = 'Failed to load exam details.';
        this.loading = false;
      }
    });
  }

  private loadQuestionsAndEvaluation(examId: number): void {
    this.examService.getExamWithQuestions(examId).subscribe({
      next: (data) => {
        this.questions = data.questions || [];
        this.loadEvaluationAndBuildResults(examId);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private loadEvaluationAndBuildResults(examId: number): void {
    if (this.evaluation) {
      this.buildQuestionResults();
      this.loading = false;
      return;
    }

    const user = this.authService.getCurrentUser();
    const userAny = user as any;
    const userId = userAny?.id ?? userAny?.userId ?? 1;

    this.examService.getUserEvaluations(userId).subscribe({
      next: (evaluations: Evaluation[]) => {
        this.evaluation = evaluations.find(e => e.examId === examId) ?? null;
        this.buildQuestionResults();
        this.loading = false;
      },
      error: () => {
        this.buildQuestionResults();
        this.loading = false;
      }
    });
  }

  private buildQuestionResults(): void {
    this.questionResults = [];
    if (!this.questions.length) return;

    const evalAny = this.evaluation as any;
    const submittedAnswers: Answer[] =
      evalAny?.answers ??
      evalAny?.userAnswers ??
      evalAny?.submission?.answers ??
      [];

    this.questions.forEach((q) => {
      const userAnswerObj = submittedAnswers.find((a: Answer) => a.questionId === q.id);
      const userAnswer = userAnswerObj?.selectedOption ?? '—';
      const correct = userAnswer !== '—' && userAnswer === q.correctAnswer;

      this.questionResults.push({
        question: q,
        userAnswer,
        correctAnswer: q.correctAnswer,
        correct
      });
    });
  }

  get correctCount(): number {                 // ← was missing
    return this.questionResults.filter(r => r.correct).length;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  downloadPDF(): void {
    if (!this.certificate || !this.exam) return;

    const doc = new jsPDF('landscape', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setDrawColor(183, 28, 28);
    doc.setLineWidth(4);
    doc.rect(30, 30, pageWidth - 60, pageHeight - 60);

    doc.setTextColor(183, 28, 28);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE OF ACHIEVEMENT', pageWidth / 2, 90, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text(this.exam.title.toUpperCase(), pageWidth / 2, 140, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('This is to certify that', pageWidth / 2, 190, { align: 'center' });

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(183, 28, 28);
    doc.text(`Student ID: ${this.certificate.userId}`, pageWidth / 2, 220, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 200);
    doc.text('has successfully completed the exam', pageWidth / 2, 250, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(220, 220, 220);
    doc.text(`Passing Score Required: ${this.exam.passScore}%`, pageWidth / 2, 290, { align: 'center' });

    doc.setDrawColor(183, 28, 28);
    doc.setLineWidth(1.5);
    doc.rect(pageWidth / 2 - 180, 320, 360, 50);
    doc.setFontSize(14);
    doc.setTextColor(183, 28, 28);
    doc.setFont('helvetica', 'bold');
    doc.text(this.certificate.certificateCode, pageWidth / 2, 350, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(200, 200, 200);
    doc.setFont('helvetica', 'normal');
    doc.text(`Issue Date: ${this.formatDate(this.certificate.issueDate)}`, pageWidth / 2, 390, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('SKILL2JOB', pageWidth - 150, pageHeight - 90, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(180, 180, 180);
    doc.setFont('helvetica', 'normal');
    doc.text(`${this.currentYear}`, pageWidth - 150, pageHeight - 70, { align: 'center' });
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 230, pageHeight - 110, pageWidth - 70, pageHeight - 110);

    doc.save(`certificate-${this.exam.title.replace(/\s+/g, '-')}.pdf`);
  }

  goBack(): void {
    this.router.navigate(['/user/certificates']);
  }
}