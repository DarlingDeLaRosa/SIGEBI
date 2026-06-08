import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseContractForm } from './purchase-contract-form';

describe('PurchaseContractForm', () => {
  let component: PurchaseContractForm;
  let fixture: ComponentFixture<PurchaseContractForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseContractForm],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseContractForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
