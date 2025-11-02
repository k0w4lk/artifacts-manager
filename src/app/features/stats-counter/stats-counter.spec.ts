import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatsCounter } from './stats-counter';

describe('StatsCounter', () => {
  let component: StatsCounter;
  let fixture: ComponentFixture<StatsCounter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsCounter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatsCounter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
