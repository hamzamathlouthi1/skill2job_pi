import { TestBed } from '@angular/core/testing';

import { TrainingCourseService } from './training-course.service';

describe('TrainingCourseService', () => {
  let service: TrainingCourseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingCourseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
