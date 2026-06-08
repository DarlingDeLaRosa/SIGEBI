import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockEntryForm } from './stock-entry-form';

describe('StockEntryForm', () => {
  let component: StockEntryForm;
  let fixture: ComponentFixture<StockEntryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockEntryForm],
    }).compileComponents();

    fixture = TestBed.createComponent(StockEntryForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
