import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableOfContent } from './table-of-content';

describe('TableOfContent', () => {
  let component: TableOfContent;
  let fixture: ComponentFixture<TableOfContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableOfContent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableOfContent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
