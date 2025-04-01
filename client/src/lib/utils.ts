import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Cache for formatter instances to avoid recreating them
const formatterCache: Record<string, Intl.NumberFormat> = {};
const dateFormatterCache: Record<string, Intl.DateTimeFormat> = {};

// Cache for image URLs
const imageUrlCache = new Map<string, string>();

/**
 * Utility function for combining classNames with Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price value to a string with appropriate currency symbol and formatting for Egyptian pounds
 * Optimized with caching for better performance
 * 
 * @param price - The price value to format
 * @param maximumFractionDigits - Maximum number of fraction digits to display (default: 0)
 * @returns Formatted price string
 */
export function formatPrice(price: number, maximumFractionDigits = 0): string {
  // Return quickly for common cases
  if (price === 0) return "0 L.E";
  
  // Use cached formatter instance for performance
  const cacheKey = `price-${maximumFractionDigits}`;
  if (!formatterCache[cacheKey]) {
    formatterCache[cacheKey] = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits,
      useGrouping: true, // This ensures thousand separators are used
    });
  }
  
  // Format using cached formatter and return with currency symbol (only L.E)
  return `${formatterCache[cacheKey].format(price)} L.E`;
}

/**
 * Attempts to parse a JSON string to an array.
 * If the input is already an array, it returns it as is.
 * @param jsonString - The JSON string to parse or an array
 * @returns Parsed array or empty array if parsing fails
 */
export function parseJsonArray(jsonString: string | string[] | unknown): string[] {
  // Fast path for arrays
  if (Array.isArray(jsonString)) {
    return jsonString;
  }
  
  // Handle string parsing with try/catch
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
 * Formats a date string to a readable format with caching for performance
 * @param dateString - The date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  try {
    // Quick fail for invalid input
    if (!dateString) return 'Invalid date';
    
    const date = new Date(dateString);
    
    // Use cached formatter for better performance
    if (!dateFormatterCache['standard']) {
      dateFormatterCache['standard'] = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
    
    return dateFormatterCache['standard'].format(date);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Creates a debounced function that delays invoking the provided function
 * Performance-optimized implementation
 * 
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
    // Clear existing timeout
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    // Set new timeout
    timeout = setTimeout(() => {
      timeout = null;
      func(...args);
    }, wait);
  };
}

/**
 * Truncates a string to a specified length and adds an ellipsis if needed
 * High-performance implementation
 * 
 * @param text - The text to truncate
 * @param maxLength - The maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  // Quick return for short or empty strings
  if (!text || text.length <= maxLength) return text || '';
  
  // Truncate and add ellipsis
  return text.slice(0, maxLength) + '...';
}

/**
 * Returns a proper URL for an image path, handling both relative and absolute paths
 * Uses caching for better performance
 * 
 * @param path - The image path from the API
 * @returns Full URL to the image
 */
export function getImageUrl(path: string | undefined): string {
  // Handle missing path
  if (!path) return "/uploads/default-announcement.svg";
  
  // Check cache first
  if (imageUrlCache.has(path)) {
    return imageUrlCache.get(path)!;
  }
  
  let result: string;
  
  // Handle default images directly
  if (path === '/uploads/default-announcement.svg' || 
      path === '/uploads/default-property.svg') {
    result = path;
  }
  // Handle external URLs
  else if (path.startsWith('http')) {
    result = path;
  } 
  // Handle uploaded images
  else if (path.startsWith('/uploads/')) {
    // For uploads, don't add the origin as they are served directly from static folder
    result = path;
  } 
  // Fallback for any other path format
  else {
    result = path;
  }
  
  // Cache the result
  imageUrlCache.set(path, result);
  return result;
}

/**
 * Preloads an image in the background
 * @param src - The image source URL
 */
export function preloadImage(src: string): void {
  if (!src) return;
  
  const img = new Image();
  img.src = getImageUrl(src);
}

/**
 * Clears the image URL cache - useful for testing or when URLs change
 */
export function clearImageCache(): void {
  imageUrlCache.clear();
}
