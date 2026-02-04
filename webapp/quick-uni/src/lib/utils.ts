import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a date string or Date object to dd/mm/yyyy
 * Using a fixed locale to prevent hydration mismatch
 */
export function formatDate(date: string | Date | number) {
  if (!date) return "N/A";
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Invalid Date";

  // Use fixed 'en-GB' or 'vi-VN' for dd/mm/yyyy format
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}