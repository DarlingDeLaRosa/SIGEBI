import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaintenanceLayout } from './maintenance-layout';

describe('MaintenanceLayout', () => {
  let component: MaintenanceLayout;
  let fixture: ComponentFixture<MaintenanceLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaintenanceLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(MaintenanceLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
