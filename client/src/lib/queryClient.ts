import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Cache for in-flight API requests to prevent duplicate requests
const apiRequestCache = new Map<string, Promise<Response>>();

/**
 * Throws an error if the response is not ok
 * Extracts the error message from the response
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Try to get meaningful error text from response
    let errorMessage: string;
    try {
      // Try to parse as JSON first
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorJson = await res.json();
        errorMessage = errorJson.message || errorJson.error || JSON.stringify(errorJson);
      } else {
        // Fall back to plain text
        errorMessage = await res.text();
      }
    } catch (e) {
      // If all else fails, use status text
      errorMessage = res.statusText;
    }
    
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

/**
 * Makes an API request with improved error handling and caching for GET requests
 * @param method - HTTP method
 * @param url - API endpoint
 * @param data - Optional request body
 * @returns Response object
 */
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // For GET requests, use request cache to prevent duplicate requests
  const isGet = method.toUpperCase() === 'GET';
  const cacheKey = isGet ? `${method}:${url}` : '';
  
  if (isGet && apiRequestCache.has(cacheKey)) {
    return apiRequestCache.get(cacheKey)!;
  }
  
  const fetchPromise = fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      // Add cache control headers for GET requests
      ...(isGet ? { 'Cache-Control': 'no-cache' } : {}),
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  }).then(async (res) => {
    // Clear cache entry once request completes
    if (isGet) {
      apiRequestCache.delete(cacheKey);
    }
    
    await throwIfResNotOk(res);
    return res;
  }).catch(error => {
    // Clear cache on error too
    if (isGet) {
      apiRequestCache.delete(cacheKey);
    }
    throw error;
  });
  
  // Store promise in cache for GET requests
  if (isGet) {
    apiRequestCache.set(cacheKey, fetchPromise);
  }
  
  return fetchPromise;
}

/**
 * Behavior options for handling 401 Unauthorized responses
 */
type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Query function factory for React Query
 * Enhanced with better error handling and response type checking
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Convert array query keys to strings
    const endpoint = typeof queryKey[0] === 'string' 
      ? queryKey[0] 
      : Array.isArray(queryKey[0]) 
        ? queryKey[0].join('/') 
        : String(queryKey[0]);
    
    try {
      const res = await fetch(endpoint, {
        credentials: "include",
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });

      // Handle 401 based on behavior option
      if (res.status === 401) {
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
        throw new Error('Unauthorized: Please sign in to continue');
      }

      await throwIfResNotOk(res);
      
      // Check for empty response
      const contentLength = res.headers.get('Content-Length');
      if (contentLength === '0') {
        return null;
      }
      
      // Parse JSON response
      return await res.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  };

/**
 * Configured query client with optimized settings for real estate application
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true, // Enable window focus refetching for better data freshness
      refetchOnMount: true, // Always refresh data when component mounts
      staleTime: 30000, // 30 seconds - improved freshness for carousel content
      retry: 1, // Allow one retry for transient network issues
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
    },
    mutations: {
      retry: 1, // Allow one retry for mutations too
      retryDelay: 1000, // Simple 1s delay for mutation retries
    },
  },
});
