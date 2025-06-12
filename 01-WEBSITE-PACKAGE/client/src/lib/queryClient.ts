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
 * Supports both new (url, options) and legacy (method, url, data) signatures
 */
export async function apiRequest(
  urlOrMethod: string,
  optionsOrUrl?: RequestInit | string,
  data?: any
): Promise<Response> {
  let url: string;
  let options: RequestInit;

  // Handle legacy three-parameter signature: (method, url, data)
  if (typeof optionsOrUrl === 'string') {
    const method = urlOrMethod;
    url = optionsOrUrl;
    options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: data ? JSON.stringify(data) : undefined,
    };
  } else {
    // Handle new two-parameter signature: (url, options)
    url = urlOrMethod;
    options = optionsOrUrl || {};
  }
  // Create a unique key for this request for caching
  const requestKey = `${options.method || 'GET'}-${url}-${JSON.stringify(options.body || {})}`;

  // Check if we already have a pending request for this exact same request
  if (apiRequestCache.has(requestKey)) {
    console.log(`Reusing pending request for: ${requestKey}`);
    const cachedRequest = apiRequestCache.get(requestKey)!;
    const res = await cachedRequest;
    return res.clone(); // Clone the response so it can be consumed multiple times
  }

  // Mobile-optimized fetch with retry logic
  const fetchWithRetry = async (retries = 3): Promise<Response> => {
    for (let i = 0; i < retries; i++) {
      try {
        // Add mobile-specific headers
        const mobileHeaders = {
          'User-Agent': navigator.userAgent || 'ReplicationApp',
          'Accept': 'application/json, text/plain, */*',
          'Cache-Control': 'no-cache',
          ...options.headers
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        const fetchOptions = {
          ...options,
          headers: mobileHeaders,
          credentials: 'include' as RequestCredentials,
          signal: controller.signal
        };

        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        return response;
      } catch (error) {
        console.warn(`Fetch attempt ${i + 1} failed:`, error);

        // Don't retry on the last attempt
        if (i === retries - 1) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    throw new Error('All retry attempts failed');
  };

  // Create the fetch promise with retry logic
  const fetchPromise = fetchWithRetry();

  // Cache the promise
  apiRequestCache.set(requestKey, fetchPromise);

  try {
    const res = await fetchPromise;

    // Remove from cache once completed
    apiRequestCache.delete(requestKey);

    // Handle 401 responses based on behavior setting
    // if (res.status === 401 && authBehavior === AuthBehavior.RedirectTo401) {
    //   console.log('Received 401, redirecting to sign in page');
    //   window.location.href = '/signin';
    //   return res; // Return the response, but the redirect will happen
    // }

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    // Remove from cache on error
    apiRequestCache.delete(requestKey);
    throw error;
  }
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