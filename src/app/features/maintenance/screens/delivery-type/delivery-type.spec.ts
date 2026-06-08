import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryType } from './delivery-type';

describe('DeliveryType', () => {
  let component: DeliveryType;
  let fixture: ComponentFixture<DeliveryType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryType],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryType);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
