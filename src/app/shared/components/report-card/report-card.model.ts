export interface ReportCardData {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  tone: 'blue' | 'green' | 'amber' | 'purple';
  highlights: readonly string[];
  note: string;
  printable?: boolean;
}

export type ReportAction = 'view' | 'download' | 'print';
