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
  // Debug info
  console.log("parseJsonArray called with:", typeof jsonString, 
    Array.isArray(jsonString) ? `array[${jsonString.length}]` : 
    (jsonString === null ? 'null' : 
     jsonString === undefined ? 'undefined' : 
     typeof jsonString === 'string' ? (jsonString.length > 100 ? jsonString.substring(0, 100) + '...' : jsonString) : 
     String(jsonString))
  );

  // CRITICAL FIX: Handle direct hash values first (common in Windows uploads)
  // These are MD5-like hashes that are often used instead of proper file paths
  if (typeof jsonString === 'string' && /^[0-9a-f]{32}$/i.test(jsonString.trim())) {
    console.log("Direct hash value detected, converting to properties path");
    const hashPath = `/properties/${jsonString.trim()}`;
    return [hashPath];
  }

  // Fast path for arrays
  if (Array.isArray(jsonString)) {
    // Process array items to ensure each one is properly formatted
    const processedArray = jsonString.map(item => {
      if (typeof item === 'string') {
        // Check if the string is just a hash
        if (/^[0-9a-f]{32}$/i.test(item.trim())) {
          return `/properties/${item.trim()}`;
        }
        // Otherwise return the string as is
        return item;
      }
      // Convert non-string values to string
      return String(item);
    });
    console.log(`Returning processed array with ${processedArray.length} items`);
    return processedArray;
  }
  
  // Handle string parsing with try/catch
  if (typeof jsonString === 'string') {
    try {
      // Check for common format: A string with comma-separated values
      if (jsonString.includes(',') && !jsonString.includes('{') && !jsonString.includes('[')) {
        console.log("String appears to be comma-separated list");
        const values = jsonString.split(',').map(s => s.trim()).filter(Boolean);
        if (values.length > 0) {
          return values;
        }
      }
      
      // First try direct JSON parsing
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        console.log(`Successfully parsed string to array with ${parsed.length} items`);
        // Ensure each item is properly formatted
        return parsed.map(item => {
          if (typeof item === 'string') {
            // Check if the string is just a hash
            if (/^[0-9a-f]{32}$/i.test(item.trim())) {
              return `/properties/${item.trim()}`;
            }
            return item;
          }
          return String(item);
        });
      } else if (parsed && typeof parsed === 'object') {
        // Handle case where it parses to an object with numeric keys (like a PHP array)
        const values = Object.values(parsed);
        console.log(`Parsed object to values array with ${values.length} items`);
        return values.map(v => String(v));
      }
      console.log("Parsed to non-array type:", typeof parsed);
      return [];
    } catch (err) {
      console.log("JSON parse error:", err instanceof Error ? err.message : String(err));
      
      // If it's a single path that failed parsing, return it as a single-item array
      if (jsonString.trim().startsWith('/')) {
        console.log("String looks like a file path, returning as single item array");
        return [jsonString];
      }
      
      // CRITICAL FIX: Check for multiple paths separated by commas or spaces
      if (jsonString.includes('/uploads/') || jsonString.includes('/properties/')) {
        console.log("String contains path-like content, splitting by separators");
        // Try to split by common separators
        const possibleItems = jsonString
          .split(/[\s,;|]+/)  // Split by spaces, commas, semicolons, or pipes
          .map(s => s.trim())
          .filter(s => s.includes('/uploads/') || s.includes('/properties/') || /^[0-9a-f]{32}$/i.test(s));
        
        if (possibleItems.length > 0) {
          return possibleItems.map(item => {
            // Format hash-only items
            if (/^[0-9a-f]{32}$/i.test(item)) {
              return `/properties/${item}`;
            }
            return item;
          });
        }
      }
      
      return [];
    }
  }
  
  // Handle object case directly (PostgreSQL sometimes returns objects for JSON arrays)
  if (jsonString && typeof jsonString === 'object') {
    const values = Object.values(jsonString);
    if (values.length > 0) {
      console.log(`Converting object to values array with ${values.length} items`);
      return values.map(v => {
        const valueStr = String(v);
        // Check if the string is just a hash
        if (/^[0-9a-f]{32}$/i.test(valueStr.trim())) {
          return `/properties/${valueStr.trim()}`;
        }
        return valueStr;
      });
    }
  }
  
  console.log("Returning empty array as fallback");
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
  
  // Simple normalization for Windows path separators and quotes
  const normalizedPath = path.replace(/\\/g, '/').replace(/"/g, '');
  
  // Add cache-busting timestamp parameter to prevent browser caching
  // This helps with images that have been re-uploaded with the same name
  const cacheBuster = `?t=${Date.now()}`;
  
  // For server-side image, we add the cache buster to ensure fresh images
  return `${normalizedPath}${cacheBuster}`;
}

/**
 * Returns a proper URL for an image path, handling both relative and absolute paths
 * Uses caching for better performance, but also adds cache-busting for local uploads
 * Simplified for better performance - minimal processing
 * 
 * @param path - The image path from the API
 * @returns Full URL to the image
 */
export function getImageUrl(path: string | undefined): string {
  // Fast processing for common scenarios
  if (!path) return "/placeholder-property.svg";
  if (path === '/placeholder-property.svg') return path;
  if (path.startsWith('http')) return path;
  
  // Note: We removed the hash-pattern check here since we now have a robust server-side
  // image matcher that can handle these Windows-uploaded images correctly
  
  // Very basic normalization
  const normalizedPath = path.replace(/\\/g, '/').replace(/"/g, '');
  
  // Add a timestamp cache-buster
  return `${normalizedPath}?t=${Date.now()}`;
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
