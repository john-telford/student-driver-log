/** Static recreation of the Sonner toast (rich colors, top-right) used for action feedback. */
export interface ToastProps {
  title?: string;
  description?: string;
  tone?: 'success' | 'error' | 'info';
}
export declare function Toast(props: ToastProps): JSX.Element;
