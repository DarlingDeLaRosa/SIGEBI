import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockEntryType } from './stock-entry-type';

describe('StockEntryType', () => {
  let component: StockEntryType;
  let fixture: ComponentFixture<StockEntryType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockEntryType],
    }).compileComponents();

    fixture = TestBed.createComponent(StockEntryType);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
