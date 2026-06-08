import { TestBed } from '@angular/core/testing';

import { WarehouseNameService } from './warehouse-name-service';

describe('WarehouseName', () => {
  let service: WarehouseNameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WarehouseNameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
