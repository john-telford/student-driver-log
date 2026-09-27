/**
 * Uppercase highway-sign button. Filled variants dim to 90% on hover.
 * @startingPoint section="Core" subtitle="Button variants and sizes" viewport="700x180"
 */
export interface ButtonProps {
  children?: React.ReactNode;
  /** primary = green fill, accent = highway yellow (the main CTA), onGreen = yellow on a green panel */
  variant?: 'primary' | 'accent' | 'outline' | 'destructive' | 'onGreen' | 'link';
  /** sm = nav CTA (12px/900), md = form submit (14px/700), lg = wide 24px padding */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  as?: 'button' | 'a';
  href?: string;
  onClick?: (e: React.MouseEvent) => void;
  type?: 'button' | 'submit';
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
