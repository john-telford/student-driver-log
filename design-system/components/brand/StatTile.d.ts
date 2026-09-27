/** Centred bordered figure: uppercase muted label over a 24px/900 tabular number (H:MM). */
export interface StatTileProps {
  label?: string;
  /** Formatted duration, H:MM — e.g. "27:10" */
  value?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function StatTile(props: StatTileProps): JSX.Element;
