import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { Exam } from '../../models/exam';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-exam-list',
  templateUrl: './exam-list.component.html',
  styleUrls: ['./exam-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ExamListComponent implements OnInit {
  exams: Exam[] = [];
  filteredExams: Exam[] = [];
  loading = true;
  error: string | null = null;
  takenExams: Map<number, { passed: boolean; score: number }> = new Map();

  activeFilter = 'all';
  searchQuery = '';
  userName: string = 'Mayssa';

  stats = {
    completedExams: 0,
    averageScore: 0,
    certificates: 0,
    pendingExams: 0
  };

  // Prediction
  predictionExam: Exam | null = null;
  predictionResult: any = null;
  predictionLoading = false;
  weakAreas: string[] = [];
  predictionTips: string[] = [];

  // Mini quiz state
  quizStep: 'quiz' | 'loading' | 'result' = 'quiz';
  quizAnswers: boolean[] = [];
  quizCurrentIndex = 0;

  quizQuestions = [
    { text: 'I studied the topic for at least 3 hours this week.', feature: 'study' },
    { text: 'I attended all training sessions related to this exam.', feature: 'attendance' },
    { text: 'I completed all practice exercises before this exam.', feature: 'submission' },
    { text: 'I feel confident about the core concepts of this exam.', feature: 'engagement' },
    { text: 'I scored above 60% in my last similar exam or test.', feature: 'previous_score' }
  ];

  constructor(
    private examService: ExamService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.loading = true;
    this.examService.getAllExams().subscribe({
      next: (data: Exam[]) => {
        this.exams = data;
        this.loadUserData();
      },
      error: () => {
        this.error = 'Failed to load exams. Please try again.';
        this.loading = false;
      }
    });
  }

  loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.router.navigate(['/signin']);
      return;
    }

    const userAny = user as any;
    const userId = userAny.id || userAny.userId || 1;

    forkJoin({
      evaluations: this.examService.getUserEvaluations(userId),
      certificates: this.examService.getUserCertificates(userId)
    }).subscribe({
      next: ({ evaluations, certificates }) => {
        if (evaluations) {
          evaluations.forEach((evaluation: any) => {
            if (evaluation.examId) {
              this.takenExams.set(evaluation.examId, {
                passed: evaluation.passed || false,
                score: evaluation.score
              });
            }
          });
        }

        this.stats.certificates = certificates?.length || 0;
        this.stats.completedExams = this.takenExams.size;
        this.stats.pendingExams = this.exams.length - this.takenExams.size;

        const scores = Array.from(this.takenExams.values()).map(e => e.score);
        this.stats.averageScore = scores.length
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;

        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterExams(filter: string): void {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter(): void {
    let filtered = [...this.exams];
    if (this.searchQuery) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    switch (this.activeFilter) {
      case 'available':
        filtered = filtered.filter(exam => !this.takenExams.has(exam.id));
        break;
      case 'completed':
        filtered = filtered.filter(exam => this.takenExams.has(exam.id));
        break;
    }
    this.filteredExams = filtered;
  }

  onSearch(event: any): void {
    this.searchQuery = event.target.value;
    this.applyFilter();
  }

  getExamStatus(examId: number): string {
    const exam = this.takenExams.get(examId);
    if (!exam) return 'AVAILABLE';
    return exam.passed ? 'PASSED' : 'FAILED';
  }

  getStatusClass(examId: number): string {
    const exam = this.takenExams.get(examId);
    if (!exam) return 'available';
    return exam.passed ? 'completed' : 'failed';
  }

  getUserScore(examId: number): number | null {
    const exam = this.takenExams.get(examId);
    return exam ? exam.score : null;
  }

  isExamAvailable(examId: number): boolean {
    return !this.takenExams.has(examId);
  }

  hasQuestions(exam: any): boolean {
    return !!(
      (exam.questions && exam.questions.length > 0) ||
      (exam.questionIds && exam.questionIds.length > 0)
    );
  }

  goToCertificates(): void {
    this.router.navigate(['/user/certificates']);
  }

  // ==================== EXAM ACTION ====================

  handleExamAction(exam: Exam): void {
    if (this.isExamAvailable(exam.id)) {
      if (!this.hasQuestions(exam)) {
        alert('This exam has no questions yet. Please check back later.');
        return;
      }
      this.openQuiz(exam);
    } else {
      this.router.navigate(['/user/exams/result', exam.id]);
    }
  }

  // ==================== QUIZ ====================

  openQuiz(exam: Exam): void {
    this.predictionExam = exam;
    this.predictionResult = null;
    this.quizAnswers = [];
    this.quizCurrentIndex = 0;
    this.quizStep = 'quiz';
    this.weakAreas = [];
    this.predictionTips = [];
  }

  answerQuestion(answer: boolean): void {
    this.quizAnswers.push(answer);
    if (this.quizCurrentIndex < this.quizQuestions.length - 1) {
      this.quizCurrentIndex++;
    } else {
      this.submitQuiz();
    }
  }

  submitQuiz(): void {
  this.quizStep = 'loading';

  const studyAnswer      = this.quizAnswers[0];
  const attendanceAnswer = this.quizAnswers[1];
  const submissionAnswer = this.quizAnswers[2];
  const engagementAnswer = this.quizAnswers[3];
  const prevScoreAnswer  = this.quizAnswers[4];

  // Count how many true answers
  const trueCount = this.quizAnswers.filter(a => a).length; // 0-5

  // Softer graduated values instead of binary extremes
  const previous_score   = prevScoreAnswer   ? 72 : 48;
  const attendance_rate  = attendanceAnswer  ? 80 : 58;
  const engagement_score = engagementAnswer  ? 70 : 48;
  const submission_rate  = submissionAnswer  ? 60 : 40;

  // completed_trainings uses real DB value + study bonus
  const completed_trainings = this.stats.completedExams + (studyAnswer ? 1 : 0);

  const payload = {
    previous_score,
    attendance_rate,
    completed_trainings,
    engagement_score,
    submission_rate
  };

  this.examService.predictPerformance(payload).subscribe({
    next: (result: any) => {
      this.predictionResult = result;
      this.analyzeWeakAreas(previous_score, attendance_rate, engagement_score, submission_rate);
      this.generatePersonalizedTips(result, previous_score, attendance_rate, engagement_score);
      this.quizStep = 'result';
    },
    error: () => {
      this.predictionResult = { error: true };
      this.quizStep = 'result';
    }
  });
}
  // ==================== ANALYSIS ====================

  analyzeWeakAreas(score: number, attendance: number, engagement: number, submission: number): void {
    this.weakAreas = [];
    if (score < 60)       this.weakAreas.push('Low exam scores');
    if (attendance < 70)  this.weakAreas.push('Low attendance');
    if (engagement < 50)  this.weakAreas.push('Low engagement');
    if (submission < 50)  this.weakAreas.push('Low submission rate');
  }

  generatePersonalizedTips(prediction: any, score: number, attendance: number, engagement: number): void {
    this.predictionTips = [];
    if (prediction.prediction === 'PASS') {
      this.predictionTips.push('💪 You\'re well-prepared! Trust your knowledge.');
      if (score >= 75)      this.predictionTips.push('⭐ Excellent previous performance - keep it up!');
      if (engagement > 70)  this.predictionTips.push('🔥 Your engagement is strong - use that momentum!');
    } else {
      this.predictionTips.push('📚 Review key concepts before starting.');
      if (score < 60)       this.predictionTips.push('🎯 Focus on topics where you struggled before.');
      if (attendance < 70)  this.predictionTips.push('⏰ Ensure you have adequate time - minimize distractions.');
      if (engagement < 50)  this.predictionTips.push('💡 Practice similar questions to build confidence.');
    }
  }

  // ==================== MODAL CLOSE / START ====================

  closePrediction(): void {
    this.predictionExam = null;
    this.predictionResult = null;
    this.quizStep = 'quiz';
    this.quizAnswers = [];
    this.quizCurrentIndex = 0;
    this.weakAreas = [];
    this.predictionTips = [];
  }

  confirmStartExam(): void {
    const exam = this.predictionExam;
    this.closePrediction();
    if (exam) {
      this.router.navigate(['/user/exams/take', exam.id]);
    }
  }
}