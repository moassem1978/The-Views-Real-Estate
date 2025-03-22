import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price value to a string with appropriate currency symbol and formatting for Egyptian pounds
 * @param price - The price value to format
 * @param maximumFractionDigits - Maximum number of fraction digits to display (default: 0)
 * @returns Formatted price string
 */
export function formatPrice(price: number, maximumFractionDigits = 0): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits,
  });
  
  // Format based on price range
  let formattedPrice = formatter.format(price);
  
  // For prices over 1 million, show in millions
  if (price >= 1000000) {
    const inMillions = price / 1000000;
    formattedPrice = `${inMillions.toFixed(inMillions % 1 === 0 ? 0 : 1)}M`;
    return `£ ${formattedPrice} L.E`;
  }
  
  // Return with Egyptian Pound symbol (£) and L.E suffix
  return `£ ${formattedPrice} L.E`;
}

/**
 * Attempts to parse a JSON string to an array.
 * If the input is already an array, it returns it as is.
 * @param jsonString - The JSON string to parse or an array
 * @returns Parsed array or empty array if parsing fails
 */
export function parseJsonArray(jsonString: string | string[] | unknown): string[] {
  if (Array.isArray(jsonString)) {
    return jsonString;
  }
  
  if (typeof jsonString === 'string') {
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  
  return [];
}

/**
 * Formats a date string to a readable format
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Creates a debounced function that delays invoking the provided function
 * @param func - The function to debounce
 * @param wait - The number of milliseconds to delay
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Truncates a string to a specified length and adds an ellipsis if needed
 * @param text - The text to truncate
 * @param maxLength - The maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
