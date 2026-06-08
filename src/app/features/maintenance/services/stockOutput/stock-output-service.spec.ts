import { TestBed } from '@angular/core/testing';

import { StockOutputService } from './stock-output-service';

describe('StockOutputService', () => {
  let service: StockOutputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockOutputService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
