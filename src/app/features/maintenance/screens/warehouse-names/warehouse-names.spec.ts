import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseNames } from './warehouse-names';

describe('WarehouseNames', () => {
  let component: WarehouseNames;
  let fixture: ComponentFixture<WarehouseNames>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarehouseNames],
    }).compileComponents();

    fixture = TestBed.createComponent(WarehouseNames);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
