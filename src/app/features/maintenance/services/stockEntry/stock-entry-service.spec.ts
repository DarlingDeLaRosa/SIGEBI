import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { StockEntryTypeService } from './stock-entry-type-service';

describe('StockEntryTypeService', () => {
  let service: StockEntryTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(StockEntryTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
