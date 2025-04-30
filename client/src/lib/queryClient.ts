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
  console.log(`FORM SUBMISSION: Making ${method} request to ${url}`);
  if (data) {
    console.log("FORM SUBMISSION DATA:", JSON.stringify(data, null, 2));
  }
  
  // For GET requests, use request cache to prevent duplicate requests
  const isGet = method.toUpperCase() === 'GET';
  const cacheKey = isGet ? `${method}:${url}` : '';
  
  if (isGet && apiRequestCache.has(cacheKey)) {
    return apiRequestCache.get(cacheKey)!;
  }

  // First, check if the user is authenticated for write operations
  if (method.toUpperCase() !== 'GET') {
    try {
      const userCheckResponse = await fetch('/api/user', {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
      });
      
      if (userCheckResponse.status === 401) {
        console.log('User not authenticated, checking for session expiration');
        
        // Try to refresh the session by calling the auth check endpoint
        const refreshResponse = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include'
        });
        
        if (refreshResponse.ok) {
          console.log("Authentication refreshed successfully");
        }
        
        if (refreshResponse.status === 401) {
          console.error('Session expired and refresh failed');
          const error = new Error('401: Authentication required to update properties');
          throw error;
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      // Continue with the request, the server will handle authentication errors
    }
  }
  
  // Proceed with the main request
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
    
    console.log(`Response status: ${res.status} ${res.statusText}`);
    
    if (res.status === 401) {
      // For 401 responses, redirect to login
      console.error('Authentication required');
      // Throw a specific error for 401 that can be handled by the UI
      throw new Error('401: Authentication required');
    }
    
    if (!res.ok) {
      try {
        // Try to get the error details as JSON
        const errorData = await res.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.message || `Error ${res.status}: ${res.statusText}`);
      } catch (jsonError) {
        // If parsing as JSON fails, try to get plain text
        try {
          const errorText = await res.text();
          console.error("API error text:", errorText);
          throw new Error(errorText || `Error ${res.status}: ${res.statusText}`);
        } catch (textError) {
          // If all else fails, throw a generic error
          throw new Error(`Request failed with status: ${res.status}`);
        }
      }
    }
    
    return res;
  }).catch(error => {
    // Clear cache on error too
    if (isGet) {
      apiRequestCache.delete(cacheKey);
    }
    console.error("Network error during form submission:", error);
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
      queryFn: getQueryFn({ on401: "returnNull" }), // Return null instead of throwing for 401 responses
      refetchInterval: false,
      refetchOnWindowFocus: false, // Disable refetching on window focus to reduce API calls
      refetchOnMount: true,        // Only fetch once when component mounts
      staleTime: 1000 * 60 * 15,   // Consider data fresh for 15 minutes (increased from 10)
      retry: 0,                    // Disable retries to reduce network load
      retryDelay: 0,               // No delay for retries
      networkMode: 'always',       // Don't wait for network reconnection
      gcTime: 1000 * 60 * 30,      // Keep cached data for 30 minutes (increased from 15)
    },
    mutations: {
      retry: 0,                    // No retries for mutations to improve error feedback
      networkMode: 'always',       // Don't wait for network reconnection
    },
  },
});
