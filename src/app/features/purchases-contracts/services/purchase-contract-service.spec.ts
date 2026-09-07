import { TestBed } from '@angular/core/testing';

import { PurchaseContractService } from './purchase-contract-service';

describe('PurchaseContractService', () => {
  let service: PurchaseContractService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PurchaseContractService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
