/** Uppercase bold field label. Optional lowercase `hint` (e.g. "(optional)"). */
export interface LabelProps {
  children?: React.ReactNode;
  htmlFor?: string;
  /** Rendered in regular weight, sentence case, muted — e.g. "(optional)" */
  hint?: string;
  onGreen?: boolean;
  style?: React.CSSProperties;
}
export declare function Label(props: LabelProps): JSX.Element;
