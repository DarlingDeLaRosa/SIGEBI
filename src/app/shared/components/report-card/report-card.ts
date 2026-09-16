import { Component, input, output } from '@angular/core';
import { ReportCardData } from './report-card.model';

@Component({
  selector: 'app-report-card',
  imports: [],
  templateUrl: './report-card.html',
  styleUrl: './report-card.css',
})
export class ReportCard {
  readonly report = input.required<ReportCardData>();
  readonly disabled = input(false);
  readonly view = output<ReportCardData>();
  readonly download = output<ReportCardData>();
  readonly print = output<ReportCardData>();
}
