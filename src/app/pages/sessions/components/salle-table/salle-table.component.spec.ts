import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalleTableComponent } from './salle-table.component';

describe('SalleTableComponent', () => {
  let component: SalleTableComponent;
  let fixture: ComponentFixture<SalleTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalleTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalleTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
