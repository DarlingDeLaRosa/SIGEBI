import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionBox } from './section-box';

describe('SectionBox', () => {
  let component: SectionBox;
  let fixture: ComponentFixture<SectionBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionBox],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionBox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
