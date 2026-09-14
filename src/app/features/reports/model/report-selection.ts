import {
  ReportAction,
  ReportCardData,
} from '../../../shared/components/report-card/report-card.model';

export interface ReportSelection {
  report: ReportCardData;
  action: ReportAction;
  scope: string;
  period: string;
}
