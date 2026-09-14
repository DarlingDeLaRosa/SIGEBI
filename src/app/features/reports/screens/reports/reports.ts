import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ReportCard } from '../../../../shared/components/report-card/report-card';
import {
  ReportAction,
  ReportCardData,
} from '../../../../shared/components/report-card/report-card.model';
import { INVENTORY_REPORTS, OFFICIAL_FORMS } from '../../data/report-catalog';
import { ReportSelectionDialog } from '../../dialog/report-selection-dialog/report-selection-dialog';
import { ReportSelection } from '../../model/report-selection';

@Component({
  selector: 'app-reports',
  imports: [ReactiveFormsModule, ReportCard],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports {
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  readonly reports = INVENTORY_REPORTS;
  readonly officialForms = OFFICIAL_FORMS;
  private readonly today = this.localDate();
  readonly filterForm = this.fb.nonNullable.group(
    {
      scope: 'rectorate',
      campus: '',
      dateMode: 'cutoff',
      cutoffDate: this.today,
      startDate: `${this.today.slice(0, 7)}-01`,
      endDate: this.today,
    },
    {
      validators: (control) => {
        const { scope, campus, dateMode, cutoffDate, startDate, endDate } = control.getRawValue();
        if (scope === 'campus' && !campus?.trim()) return { campusRequired: true };
        if (dateMode === 'cutoff') return cutoffDate ? null : { datesRequired: true };
        if (!startDate || !endDate) return { datesRequired: true };
        return startDate > endDate ? { dateOrder: true } : null;
      },
    },
  );

  selectReport(report: ReportCardData, action: ReportAction) {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      return;
    }
    const value = this.filterForm.getRawValue();
    const scope =
      value.scope === 'consolidated'
        ? 'Consolidado desde Rectoría'
        : value.scope === 'campus'
          ? `Recinto: ${value.campus.trim()}`
          : 'Rectoría';
    const period =
      value.dateMode === 'cutoff'
        ? `Al ${this.displayDate(value.cutoffDate)}`
        : `Del ${this.displayDate(value.startDate)} al ${this.displayDate(value.endDate)}`;
    this.dialog.open<ReportSelectionDialog, ReportSelection>(ReportSelectionDialog, {
      width: '540px',
      maxWidth: '95vw',
      data: { report, action, scope, period },
    });
  }

  private displayDate(value: string): string {
    return value.split('-').reverse().join('/');
  }

  private localDate(): string {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}
