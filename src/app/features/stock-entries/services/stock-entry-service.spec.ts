import { TestBed } from '@angular/core/testing';

import { StockEntryService } from './stock-entry-service';

describe('StockEntryService', () => {
  let service: StockEntryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StockEntryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
