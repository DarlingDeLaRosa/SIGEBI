export interface tableColumnsInterface {
  key: string | string[];
  label: string;
  format?: 'currency' | 'date' | 'number' | 'titlecase' | 'lowercase' | 'uppercase';
  render?: 'app-badge' | 'app-payment-badge';
  align?: 'left' | 'center' | 'right';
}

export interface TableAction {
  label: string;
  icon: string;
  class?: string;
  visible?: (row: any) => boolean;
  action: (row: any) => void;
}