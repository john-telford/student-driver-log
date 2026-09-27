/**
 * The brand's signature object: a white reflective frame with a black keyline wrapping a green sign panel.
 * Used for every full-page moment — login, register, 404.
 * @startingPoint section="Brand" subtitle="Highway sign panel card" viewport="700x400"
 */
export interface SignCardProps {
  children?: React.ReactNode;
  /** Max width in px — 384 (max-w-sm) on auth screens */
  width?: number;
  style?: React.CSSProperties;
}
export declare function SignCard(props: SignCardProps): JSX.Element;
