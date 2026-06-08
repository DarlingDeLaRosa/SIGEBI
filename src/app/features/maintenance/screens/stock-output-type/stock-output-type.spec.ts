import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockOutputType } from './stock-output-type';

describe('StockOutputType', () => {
  let component: StockOutputType;
  let fixture: ComponentFixture<StockOutputType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockOutputType],
    }).compileComponents();

    fixture = TestBed.createComponent(StockOutputType);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
