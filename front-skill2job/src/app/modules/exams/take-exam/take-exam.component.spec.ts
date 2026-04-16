import { ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { TakeExamComponent } from './take-exam.component';
import { ExamService } from '../../services/exam.service';
import { AuthService } from '../../services/auth.service';
import { AntiCheatService } from '../../services/anti-cheat.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('TakeExamComponent', () => {
  let component: TakeExamComponent;
  let fixture: ComponentFixture<TakeExamComponent>;
  let examServiceSpy: jasmine.SpyObj<ExamService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let antiCheatSpy: jasmine.SpyObj<AntiCheatService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let violationSubject: Subject<any>;
  let autoSubmitSubject: Subject<void>;

  const mockData = {
    exam: { id: 1, title: 'Test Exam', duration: 10 },
    questions: [
      { id: 101, content: 'Q1', options: ['A', 'B'], correctAnswer: 'A' },
      { id: 102, content: 'Q2', options: ['C', 'D'], correctAnswer: 'C' }
    ]
  };

  beforeEach(async () => {
    // Fresh subjects for every test
    violationSubject = new Subject<any>();
    autoSubmitSubject = new Subject<void>();

    examServiceSpy = jasmine.createSpyObj('ExamService', ['getExamWithQuestions', 'submitExam']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    antiCheatSpy = jasmine.createSpyObj('AntiCheatService', ['start', 'stop']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    examServiceSpy.getExamWithQuestions.and.returnValue(of(mockData as any));
    authServiceSpy.getCurrentUser.and.returnValue({ id: 1, username: 'test' } as any);

    (antiCheatSpy as any).violation$ = violationSubject.asObservable();
    (antiCheatSpy as any).autoSubmit$ = autoSubmitSubject.asObservable();

    spyOn(window, 'alert');
    spyOn(window, 'confirm').and.returnValue(true);

    await TestBed.configureTestingModule({
      declarations: [TakeExamComponent],
      providers: [
        { provide: ExamService, useValue: examServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: AntiCheatService, useValue: antiCheatSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } }
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(TakeExamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit → loadExam
    tick();                  // resolves observable
    discardPeriodicTasks();  // clears timer from startTimer()
  }));

  afterEach(() => {
    discardPeriodicTasks();
    fixture.destroy();
  });

  it('should create and load exam', fakeAsync(() => {
    expect(component).toBeTruthy();
    expect(examServiceSpy.getExamWithQuestions).toHaveBeenCalledWith(1);
    expect(component.questions.length).toBe(2);
    expect(component.timeLeft).toBe(600); // 10 * 60
    discardPeriodicTasks();
  }));

  it('should navigate between questions', fakeAsync(() => {
    expect(component.currentQuestionIndex).toBe(0);
    component.nextQuestion();
    expect(component.currentQuestionIndex).toBe(1);
    component.previousQuestion();
    expect(component.currentQuestionIndex).toBe(0);
    discardPeriodicTasks();
  }));

  it('should select an answer', fakeAsync(() => {
    component.selectAnswer('A');
    expect(component.answers.length).toBe(1);
    expect(component.answers[0].selectedOption).toBe('A');
    discardPeriodicTasks();
  }));

  it('should submit exam when all questions are answered', fakeAsync(() => {
    component.selectAnswer('A');
    component.nextQuestion();
    component.selectAnswer('C');
    examServiceSpy.submitExam.and.returnValue(of({ score: 100 }));
    component.submitExam();
    tick();
    expect(examServiceSpy.submitExam).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalled();
    discardPeriodicTasks();
  }));

  it('should handle violations via anti-cheat service', fakeAsync(() => {
    violationSubject.next({ type: 'TAB_SWITCH', count: 1 });
    expect(component.warningVisible).toBeTrue();
    expect(component.violationType).toBe('TAB_SWITCH');
    discardPeriodicTasks();
  }));

  it('should start timer and decrease timeLeft', fakeAsync(() => {
    const timeBefore = component.timeLeft;
    tick(1000);
    expect(component.timeLeft).toBe(timeBefore - 1);
    discardPeriodicTasks();
  }));
});