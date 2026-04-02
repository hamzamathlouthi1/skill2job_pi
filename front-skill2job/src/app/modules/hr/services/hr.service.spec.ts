import { TestBed } from '@angular/core/testing';
import { HrService } from './hr.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('HrService', () => {
  let service: HrService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(HrService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
