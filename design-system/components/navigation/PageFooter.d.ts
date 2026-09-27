/** Hairline footer with 10px uppercase legal links and an optional monospace version stamp. */
export interface PageFooterProps {
  links?: string[];
  /** Monospace build stamp, e.g. "v1.4.2 · 9f3c1ab" */
  version?: string;
  maxWidth?: number;
}
export declare function PageFooter(props: PageFooterProps): JSX.Element;
