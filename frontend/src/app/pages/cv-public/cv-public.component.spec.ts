import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CvPublicComponent } from './cv-public.component';

describe('CvPublicComponent', () => {
  let component: CvPublicComponent;
  let fixture: ComponentFixture<CvPublicComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CvPublicComponent]
    });
    fixture = TestBed.createComponent(CvPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
