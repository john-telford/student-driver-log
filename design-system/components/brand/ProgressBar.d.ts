/**
 * 16px pill progress bar with an uppercase label, a right-hand "left to go" figure and a hover tooltip.
 * Green for the 50-hour total, highway yellow for the 10-hour night requirement.
 * @startingPoint section="Brand" subtitle="Requirement progress bar" viewport="700x150"
 */
export interface ProgressBarProps {
  label?: string;
  percent?: number;
  /** Right-hand figure, e.g. "12h 30m left" or "Complete" */
  remaining?: string;
  /** Hover-only exact breakdown, e.g. "37:30 total (27:10 day + 10:20 night)" */
  tooltip?: string;
  tone?: 'primary' | 'accent';
  /** Right-aligned caption under the bar, e.g. "75% of 50:00" */
  caption?: string;
}
export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
