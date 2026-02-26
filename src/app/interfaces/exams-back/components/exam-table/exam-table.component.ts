import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ExamsService } from '../../services/exams.service';
import { Exam } from '../../models/exams.model';

@Component({
  selector: 'app-exam-table',
  templateUrl: './exam-table.component.html',
  styleUrls: ['./exam-table.component.scss']
})
export class ExamTableComponent implements OnInit {
  exams: Exam[] = [];
  loading = false;
  errorMessage = '';

  constructor(
    private examsService: ExamsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.loading = true;
    this.examsService.getAllExams().subscribe({
      next: (data) => {
        this.exams = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading exams:', error);
        this.errorMessage = 'Failed to load exams. Make sure the backend is running.';
        this.loading = false;
      }
    });
  }

  addExam(): void {
  console.log('========== ADD EXAM CLICKED ==========');
  console.log('1. Before any action - Token:', localStorage.getItem('token'));
  console.log('2. Before any action - User:', localStorage.getItem('user'));
  
  // Check if we're still authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ Token missing BEFORE navigation!');
    return;
  }
  
  console.log('3. Attempting to navigate to:', '/admin/exams/exam-form');
  
  // Try with a small delay to see if something clears it
  setTimeout(() => {
    console.log('4. After delay - Token still:', localStorage.getItem('token'));
    this.router.navigate(['/admin/exams/exam-form']);
  }, 100);
}

  editExam(id: number): void {
    this.router.navigate(['/admin/exams/exam-form', id]);
  }

  deleteExam(id: number): void {
    if (confirm('Are you sure you want to delete this exam?')) {
      this.examsService.deleteExam(id).subscribe({
        next: () => {
          this.loadExams();
        },
        error: (error) => {
          console.error('Error deleting exam:', error);
          alert('Failed to delete exam');
        }
      });
    }
  }

  viewEvaluations(examId: number): void {
    this.router.navigate(['/admin/exams/evaluation-table', examId]);
  }

  manageQuestions(examId: number): void {
    this.router.navigate(['/admin/exams/question-form', examId]);
  }
}