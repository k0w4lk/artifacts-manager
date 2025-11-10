import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraDialog } from './camera-dialog';

describe('CameraDialog', () => {
  let component: CameraDialog;
  let fixture: ComponentFixture<CameraDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CameraDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CameraDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
