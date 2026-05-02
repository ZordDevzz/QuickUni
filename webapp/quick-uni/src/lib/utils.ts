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
  
  /**
   * Recursively converts all empty strings in an object to null.
   * Useful for processing form data before database insertion.
   */
  export function nullifyEmptyStrings<T>(obj: T): T {
    if (obj === null || obj === undefined || typeof obj !== "object") {
      return obj === "" ? (null as unknown as T) : obj;
    }
  
      if (Array.isArray(obj)) {
        return obj.map(nullifyEmptyStrings) as unknown as T;
      }
    
      const result = {} as Record<string, unknown>;
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = (obj as Record<string, unknown>)[key];
          result[key] = value === "" ? null : nullifyEmptyStrings(value);
        }
      }
      return result as unknown as T;
    }

export function stringToHslColor(str: string, s = 70, l = 85) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, ${s}%, ${l}%)`;
}