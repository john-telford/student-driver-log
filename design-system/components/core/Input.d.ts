/** Single-line field. `onGreen` switches to the translucent-white treatment used on sign panels. */
export interface InputProps {
  type?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  name?: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  /** true on green sign panels (auth screens): 10% white fill, white text, yellow focus ring */
  onGreen?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
}
export declare function Input(props: InputProps): JSX.Element;
