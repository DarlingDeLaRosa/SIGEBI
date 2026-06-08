import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseContract } from './purchase-contract';

describe('PurchaseContract', () => {
  let component: PurchaseContract;
  let fixture: ComponentFixture<PurchaseContract>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseContract],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseContract);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
