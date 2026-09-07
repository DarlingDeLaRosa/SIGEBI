import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Outputs } from './outputs';

describe('Outputs', () => {
  let component: Outputs;
  let fixture: ComponentFixture<Outputs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Outputs],
    }).compileComponents();

    fixture = TestBed.createComponent(Outputs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
