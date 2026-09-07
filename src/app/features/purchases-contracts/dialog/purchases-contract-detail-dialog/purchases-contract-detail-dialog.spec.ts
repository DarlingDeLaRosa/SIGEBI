import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasesContractDetailDialog } from './purchases-contract-detail-dialog';

describe('PurchasesContractDetailDialog', () => {
  let component: PurchasesContractDetailDialog;
  let fixture: ComponentFixture<PurchasesContractDetailDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasesContractDetailDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchasesContractDetailDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
