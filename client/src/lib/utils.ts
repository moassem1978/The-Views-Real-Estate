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
  
  // Simply return number with thousand separators using toLocaleString and "L.E" suffix
  return `${price.toLocaleString()} L.E`;
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
 * Generates a resized image URL by appending size parameters
 * This assumes your backend supports resizing through URL parameters
 * If not, it returns the original URL
 * 
 * @param path - The image path
 * @param size - The desired size (small, medium, large)
 * @returns URL with size parameters
 */
export function getResizedImageUrl(path: string | undefined, size: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium'): string {
  // Handle missing path
  if (!path) return "/uploads/default-announcement.svg";
  
  // For SVG files, no resizing needed
  if (path.endsWith('.svg')) return path;
  
  // For non-upload paths or external URLs, return as is
  if (!path.startsWith('/uploads/') || path.startsWith('http')) return path;
  
  // Add cache-busting timestamp parameter to prevent browser caching
  // This helps with images that have been re-uploaded with the same name
  const cacheBuster = `?t=${Date.now()}`;
  
  // For server-side image, we add the cache buster to ensure fresh images
  return `${path}${cacheBuster}`;
}

/**
 * Returns a proper URL for an image path, handling both relative and absolute paths
 * Uses caching for better performance, but also adds cache-busting for local uploads
 * Enhanced to handle Windows-style paths and various other path formats
 * 
 * @param path - The image path from the API
 * @returns Full URL to the image
 */
export function getImageUrl(path: string | undefined): string {
  // Handle missing path
  if (!path) return "/placeholder-property.svg";
  
  // For well-known default images, don't add cache-busting
  if (path === '/uploads/default-announcement.svg' || 
      path === '/uploads/default-property.svg' ||
      path === '/placeholder-property.svg') {
    return path;
  }
  
  // Handle external URLs as-is
  if (path.startsWith('http')) {
    return path;
  }
  
  // Fix Windows-style backslashes if present 
  let normalizedPath = path.replace(/\\/g, '/');
  
  // If path has double quotes (from DB JSON), remove them
  normalizedPath = normalizedPath.replace(/"/g, '');
  
  // Make sure path always starts with / for proper URL formatting
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }
  
  // Additional check for common paths to ensure consistency
  // Often DB might have paths without the /uploads prefix
  if (!normalizedPath.includes('/uploads/') && 
      !normalizedPath.startsWith('/placeholder') && 
      !normalizedPath.startsWith('/public/')) {
    
    // Check if it's a property image with filename pattern
    if (/^\/[a-f0-9]{32}$/i.test(normalizedPath)) {
      normalizedPath = `/uploads/properties${normalizedPath}`;
    }
    // Check if it's just a properties filename
    else if (/^\/properties\/[a-f0-9]{32}$/i.test(normalizedPath)) {
      normalizedPath = `/uploads${normalizedPath}`;
    }
  }
  
  // Add a timestamp cache-buster to force fresh image & prevent caching issues
  const cacheBuster = `?t=${Date.now()}-${Math.floor(Math.random() * 10)}`;
  return `${normalizedPath}${cacheBuster}`;
}

/**
 * Preloads an image in the background with low priority
 * @param src - The image source URL
 */
export function preloadImage(src: string): void {
  if (!src) return;
  
  // Use requestIdleCallback to preload images only when the browser is idle
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      const img = new Image();
      // Use a smaller thumbnail version for preloading
      img.src = getResizedImageUrl(src, 'small');
      img.fetchPriority = 'low';
      img.loading = 'lazy';
    });
  } else {
    // Fallback to setTimeout for browsers that don't support requestIdleCallback
    setTimeout(() => {
      const img = new Image();
      img.src = getResizedImageUrl(src, 'small');
      img.fetchPriority = 'low';
      img.loading = 'lazy';
    }, 1000);
  }
}

/**
 * Clears the image URL cache - useful for testing or when URLs change
 */
export function clearImageCache(): void {
  imageUrlCache.clear();
}
