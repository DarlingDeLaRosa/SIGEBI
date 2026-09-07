import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryAdjustment } from './inventory-adjustment';

describe('InventoryAdjustment', () => {
  let component: InventoryAdjustment;
  let fixture: ComponentFixture<InventoryAdjustment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryAdjustment],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryAdjustment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
