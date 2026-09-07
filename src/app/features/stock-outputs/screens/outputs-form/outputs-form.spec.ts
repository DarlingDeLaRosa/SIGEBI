import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputsForm } from './outputs-form';

describe('OutputsForm', () => {
  let component: OutputsForm;
  let fixture: ComponentFixture<OutputsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutputsForm],
    }).compileComponents();

    fixture = TestBed.createComponent(OutputsForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
