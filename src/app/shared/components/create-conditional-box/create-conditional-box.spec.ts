import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateConditionalBox } from './create-conditional-box';

describe('CreateConditionalBox', () => {
  let component: CreateConditionalBox;
  let fixture: ComponentFixture<CreateConditionalBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateConditionalBox],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateConditionalBox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
