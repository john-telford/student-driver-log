import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formats a non-negative integer number of minutes as H:MM (e.g. 90 → "1:30"). */
export function formatHMM(minutes: number): string {
  const total = Math.floor(Math.max(0, minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}
