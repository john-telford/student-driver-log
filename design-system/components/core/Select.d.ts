/** Native select styled to match Input. Used for location type, weather and the student switcher. */
export interface SelectOption { value: string; label: string }
export interface SelectProps {
  options?: SelectOption[];
  value?: string;
  defaultValue?: string;
  /** Leading empty option label; pass "" to omit */
  placeholder?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  onGreen?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  style?: React.CSSProperties;
}
export declare function Select(props: SelectProps): JSX.Element;
