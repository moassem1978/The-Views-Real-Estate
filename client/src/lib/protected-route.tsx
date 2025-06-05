import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  path: string;
  component: () => React.JSX.Element;
  requiredRole?: string | string[];
}

export function ProtectedRoute({ 
  path, 
  component: Component,
  requiredRole 
}: ProtectedRouteProps) {
  const { user, isLoading, error } = useAuth();
  const [location] = useLocation();
  const [redirectUrl, setRedirectUrl] = useState("/signin");
  
  // Force a re-check of authentication on route changes
  useEffect(() => {
    // Store the current location for redirecting back after login
    if (location !== "/signin") {
      sessionStorage.setItem("redirectAfterLogin", location);
    }
    
    // Add a redirect URL parameter to help the login page know where to send the user after login
    setRedirectUrl(`/signin?redirect=${encodeURIComponent(location)}`);
  }, [location]);

  // Show loading state
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-[#B87333]" />
        </div>
      </Route>
    );
  }

  // Authentication check with debug logging (TEMPORARILY BYPASSED FOR TESTING)
  if (!user) {
    console.debug(`🔓 [ProtectedRoute] Authentication temporarily bypassed for testing path ${path}`);
    // TEMP: Allow access without authentication for testing
    return (
      <Route path={path}>
        <Component />
      </Route>
    );
  }

  console.debug(`[ProtectedRoute] User authenticated: ${user.username} (${user.role}) for path: ${path}`);

  // Role-based access check (if required)
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    console.debug(`[ProtectedRoute] Checking roles. Required: [${roles.join(', ')}], User has: ${user.role}`);
    
    if (!roles.includes(user.role)) {
      console.error(`[ProtectedRoute] Access denied for user ${user.username} (${user.role}). Required roles: [${roles.join(', ')}]`);
      return (
        <Route path={path}>
          <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="mb-6">You don't have permission to access this page.</p>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-[#B87333] text-white rounded hover:bg-[#964B00] transition-colors"
            >
              Go Back
            </button>
          </div>
        </Route>
      );
    }
  }

  // User is authenticated and has the required role
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}