/**
 * Data table with uppercase muted headers and 20%-muted zebra rows. Numbers are tabular.
 * @startingPoint section="Core" subtitle="Zebra data table with uppercase headers" viewport="700x260"
 */
export interface TableColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  /** true renders the cell with tabular-nums */
  numeric?: boolean;
}
export interface TableProps {
  columns?: TableColumn[];
  rows?: Record<string, React.ReactNode>[];
  zebra?: boolean;
  /** 8px row padding instead of 12px — used in the dashboard mini-table */
  dense?: boolean;
}
export declare function Table(props: TableProps): JSX.Element;
