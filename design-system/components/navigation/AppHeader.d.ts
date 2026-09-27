/**
 * The app shell's green header: wordmark, uppercase nav links, a yellow CTA and a 4px highway-yellow rule beneath.
 * @startingPoint section="Navigation" subtitle="Green app header with yellow rule" viewport="700x120"
 */
export interface AppHeaderLink { label: string; href?: string }
export interface AppHeaderProps {
  links?: AppHeaderLink[];
  /** Label of the current link — rendered full-white instead of 80% */
  active?: string;
  /** Yellow action button slot (e.g. "+ Log Trip") */
  cta?: React.ReactNode;
  /** Far-right slot: student selector, user name, sign-out */
  right?: React.ReactNode;
  /** 896 in the app shell, 768 on public pages */
  maxWidth?: number;
  onNavigate?: (link: AppHeaderLink) => void;
}
export declare function AppHeader(props: AppHeaderProps): JSX.Element;
