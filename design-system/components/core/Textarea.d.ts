/** Multi-line notes field. Resize is disabled, matching the trip form. */
export interface TextareaProps {
  rows?: number;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  name?: string;
  id?: string;
  maxLength?: number;
  disabled?: boolean;
  invalid?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  style?: React.CSSProperties;
}
export declare function Textarea(props: TextareaProps): JSX.Element;
