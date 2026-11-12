export interface tableColumnsInterface {
  key: string | string[];
  label: string;
  format?: 'currency' | 'date' | 'number' | 'titlecase' | 'lowercase' | 'uppercase';
  render?: 'app-badge' | 'app-payment-badge';
  align?: 'left' | 'center' | 'right';
}

export interface TableActionRule {
  visible?: (row: any) => boolean;
  disabled?: (row: any) => boolean;
  disabledReason?: (row: any) => string;
}

export type BasicActionRules = Partial<Record<'detail' | 'edit' | 'remove', TableActionRule>>;

export interface TableAction extends TableActionRule {
  label: string;
  icon: string;
  class?: string;
  action: (row: any) => void;
}
