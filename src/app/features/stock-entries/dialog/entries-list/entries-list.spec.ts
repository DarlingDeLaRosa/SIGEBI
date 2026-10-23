import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntriesListDialog } from './entries-list';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { StockEntryService } from '../../services/stock-entry-service';

describe('EntriesListDialog', () => {
  let component: EntriesListDialog;
  let fixture: ComponentFixture<EntriesListDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntriesListDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: 1 },
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: StockEntryService, useValue: { getEntryByIdOrden: () => of({ data: [] }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EntriesListDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
