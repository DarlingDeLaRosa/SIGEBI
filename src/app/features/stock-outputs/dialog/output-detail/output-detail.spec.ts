import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputDetail } from './output-detail';

describe('OutputDetail', () => {
  let component: OutputDetail;
  let fixture: ComponentFixture<OutputDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutputDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(OutputDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
