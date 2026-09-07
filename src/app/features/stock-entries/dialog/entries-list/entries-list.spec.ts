import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntriesList } from './entries-list';

describe('EntriesList', () => {
  let component: EntriesList;
  let fixture: ComponentFixture<EntriesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntriesList],
    }).compileComponents();

    fixture = TestBed.createComponent(EntriesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
