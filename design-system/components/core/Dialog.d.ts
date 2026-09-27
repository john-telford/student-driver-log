/** Centred confirmation modal over a 50% black scrim. Only used for destructive confirmations. */
export interface DialogProps {
  open?: boolean;
  title?: string;
  /** Plain-language consequence, ending in "This cannot be undone." for destructive actions */
  description?: string;
  children?: React.ReactNode;
  /** Right-aligned actions: Cancel (outline) then the destructive button */
  footer?: React.ReactNode;
  onClose?: () => void;
}
export declare function Dialog(props: DialogProps): JSX.Element | null;
