import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingToast } from './loading-toast';

describe('LoadingToast', () => {
  let component: LoadingToast;
  let fixture: ComponentFixture<LoadingToast>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingToast],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingToast);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
