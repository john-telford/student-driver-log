/**
 * White panel with a 1px hairline border and 4px radius — the app's default content container.
 * @startingPoint section="Core" subtitle="Bordered content panel with header row" viewport="700x260"
 */
export interface CardProps {
  children?: React.ReactNode;
  /** Uppercase 14px/900 heading; renders a bordered header row */
  title?: string;
  /** Right-aligned header slot — usually a link Button */
  action?: React.ReactNode;
  /** false removes the 24px body padding (for flush tables) */
  padded?: boolean;
  style?: React.CSSProperties;
}
export declare function Card(props: CardProps): JSX.Element;
