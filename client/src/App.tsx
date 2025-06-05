import { Suspense, useState, useEffect } from "react";
import { Router, Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import FrontendMonitoring from "@/lib/monitoring";
import { ErrorBoundary } from "react-error-boundary";
import { useAnalytics } from "@/hooks/use-analytics";

// Pages - lazy loaded for better performance
import Home from "@/pages/Home";
import Properties from "@/pages/Properties";
import PropertyDetails from "@/pages/PropertyDetails";
import Projects from "@/pages/Projects";
import ProjectDetails from "@/pages/ProjectDetails";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Services from "@/pages/Services";
import Blog from "@/pages/Blog";
import ArticlePage from "@/pages/ArticlePage";
import Dashboard from "@/pages/Dashboard";
import SignIn from "@/pages/SignIn";
import OTPLogin from "@/pages/OTPLogin";
import NotFound from "@/pages/not-found";
import InternationalProperties from "@/pages/InternationalProperties";
import Announcements from "@/pages/Announcements";
import AnnouncementDetails from "@/pages/AnnouncementDetails";

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading application...</p>
      </div>
    </div>
  );
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  useEffect(() => {
    console.error('App Error Boundary triggered:', error);
    FrontendMonitoring.captureError(error, 'app_error_boundary');
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Application Error</h2>
          <p className="text-gray-600 mb-4">Something went wrong while loading the application.</p>
        </div>

        <details className="mb-4">
          <summary className="cursor-pointer text-sm text-gray-600 mb-2 hover:text-gray-800">
            View error details
          </summary>
          <div className="text-xs bg-gray-100 p-3 rounded border overflow-auto max-h-32">
            <div className="font-mono">
              <div className="font-semibold text-red-600 mb-1">Error:</div>
              <div className="mb-2">{error.message}</div>
              {error.stack && (
                <>
                  <div className="font-semibold text-red-600 mb-1">Stack trace:</div>
                  <pre className="whitespace-pre-wrap text-xs">{error.stack}</pre>
                </>
              )}
            </div>
          </div>
        </details>

        <div className="space-y-2">
          <button
            onClick={resetErrorBoundary}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  useAnalytics();

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background">
          <OfflineIndicator />
          <Suspense fallback={<LoadingSpinner />}>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/properties" component={Properties} />
              <Route path="/properties/:id" component={PropertyDetails} />
              <Route path="/international" component={InternationalProperties} />
              <Route path="/projects" component={Projects} />
              <Route path="/projects/:slug" component={ProjectDetails} />
              <Route path="/about" component={About} />
              <Route path="/contact" component={Contact} />
              <Route path="/services" component={Services} />
              <Route path="/blog" component={Blog} />
              <Route path="/blog/:slug" component={ArticlePage} />
              <Route path="/announcements" component={Announcements} />
              <Route path="/announcements/:id" component={AnnouncementDetails} />
              <Route path="/signin" component={SignIn} />
              <Route path="/otp-login" component={OTPLogin} />
              <ProtectedRoute path="/dashboard" component={Dashboard} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize monitoring and other services
    try {
      FrontendMonitoring.initialize();
      console.log("✅ Frontend monitoring initialized successfully");
    } catch (error) {
      console.warn("⚠️ Frontend monitoring initialization failed:", error);
    }

    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('Application error caught by boundary:', error, errorInfo);
        FrontendMonitoring.captureError(error, 'app_boundary');
      }}
      onReset={() => {
        console.log("Error boundary reset");
        window.location.reload();
      }}
    >
      <AppContent />
    </ErrorBoundary>
  );
}

export default App;