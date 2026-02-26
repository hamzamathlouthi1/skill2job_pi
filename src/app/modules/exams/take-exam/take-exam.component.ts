import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExamService } from '../../services/exam.service';
import { Exam, Question, Answer, ExamSubmission } from '../../models/exam';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-take-exam',
  templateUrl: './take-exam.component.html',
  styleUrls: ['./take-exam.component.scss']
})
export class TakeExamComponent implements OnInit, OnDestroy {
  exam: Exam | null = null;
  questions: Question[] = [];
  currentQuestionIndex = 0;
  answers: Answer[] = [];
  loading = true;
  submitting = false;
  timeLeft: number = 0;
  timerInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const examId = Number(this.route.snapshot.paramMap.get('id'));
    if (examId) {
      this.loadExam(examId);
    } else {
      this.router.navigate(['/user/exams']);
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadExam(examId: number): void {
    this.loading = true;
    this.examService.getExamWithQuestions(examId).subscribe({
      next: (data: { exam: Exam; questions: Question[] }) => {
        this.exam = data.exam;
        this.questions = data.questions;
        this.timeLeft = (this.exam?.duration || 30) * 60;
        this.startTimer();
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading exam:', err);
        this.loading = false;
        alert('Error loading exam. Please try again.');
        this.router.navigate(['/user/exams']);
      }
    });
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.submitExam();
      }
    }, 1000);
  }

  get currentQuestion(): Question {
    return this.questions[this.currentQuestionIndex];
  }

  selectAnswer(option: string): void {
    const existingAnswerIndex = this.answers.findIndex(
      a => a.questionId === this.currentQuestion.id
    );
    if (existingAnswerIndex !== -1) {
      this.answers[existingAnswerIndex].selectedOption = option;
    } else {
      this.answers.push({
        questionId: this.currentQuestion.id,
        selectedOption: option
      });
    }
  }

  isAnswerSelected(option: string): boolean {
    const answer = this.answers.find(a => a.questionId === this.currentQuestion.id);
    return answer?.selectedOption === option;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  canSubmit(): boolean {
    return this.answers.length === this.questions.length;
  }

  getProgress(): number {
    return (this.answers.length / this.questions.length) * 100;
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  submitExam(): void {
    if (this.submitting) return;

    if (this.answers.length < this.questions.length) {
      const confirmSubmit = confirm(
        `You have answered ${this.answers.length} out of ${this.questions.length} questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    this.submitting = true;
    if (this.timerInterval) clearInterval(this.timerInterval);

    const user = this.authService.getCurrentUser();
    if (!user) {
      alert('You must be logged in to submit an exam.');
      this.router.navigate(['/signin']);
      return;
    }

    const userAny = user as any;
    const userId = userAny.id ?? userAny.userId ?? 1;

    const submission: ExamSubmission = {
      examId: this.exam!.id,
      userId: userId,
      answers: this.answers
    };

    // ← Persist answers so detail page can access them after navigation
    sessionStorage.setItem(
      `exam_submission_${this.exam!.id}`,
      JSON.stringify(submission)
    );

    this.examService.submitExam(submission).subscribe({
  next: (result: any) => {
    console.log('Submit result from backend:', result);
    
    // ← Save AFTER successful response, use examId from submission
    sessionStorage.setItem(
      `exam_submission_${submission.examId}`,
      JSON.stringify(submission)
    );
    console.log('Saved to sessionStorage, key:', `exam_submission_${submission.examId}`);
    
    alert(`Exam submitted! Your score: ${result.score?.toFixed(1) ?? '0'}%`);
    this.router.navigate(['/user/exams/result', this.exam!.id], {
      state: { submission }
    });
  },
  error: (err: any) => {
    console.error('Error submitting exam:', err);
    this.submitting = false;
    alert('Error submitting exam. Please try again.');
  }
});
  }
}