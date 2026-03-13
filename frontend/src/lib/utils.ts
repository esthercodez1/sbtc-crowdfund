import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STX_USD_RATE = 0.45;

export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return "gradient-progress-success";
  if (percentage >= 67) return "gradient-progress-high";
  if (percentage >= 34) return "gradient-progress-mid";
  return "gradient-orange";
}
