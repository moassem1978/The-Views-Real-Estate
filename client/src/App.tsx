import { Suspense, useEffect, useState, lazy } from "react";
import { Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { clearImageCache } from "./lib/utils";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { ErrorBoundary } from "react-error-boundary";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";

// Import necessary components from ui library
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Download, RefreshCw } from "lucide-react";

// Streamlined loading fallback
const LoadingFallback = () => (
  <div className="container mx-auto px-4 py-8">
    <Skeleton className="h-12 w-48 mb-4" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-64 w-full rounded-lg" />
      ))}
    </div>
  </div>
);

// Optimized dynamic imports with explicit chunk names and preloading hints
const Home = lazy(() => import(/* webpackChunkName: "home" */ "@/pages/Home"));
const Properties = lazy(() => import(/* webpackChunkName: "properties" */ "@/pages/Properties"));
const PropertyDetails = lazy(() => import(/* webpackChunkName: "property-details" */ "@/pages/PropertyDetails"));
// Specialized component for international properties
const InternationalProperties = lazy(() => import(/* webpackChunkName: "international" */ "@/pages/InternationalProperties"));
const Contact = lazy(() => import(/* webpackChunkName: "contact" */ "@/pages/Contact"));
const About = lazy(() => import(/* webpackChunkName: "about" */ "@/pages/About"));
const Services = lazy(() => import(/* webpackChunkName: "services" */ "@/pages/Services"));
const ServiceDetails = lazy(() => import(/* webpackChunkName: "service-details" */ "@/pages/ServiceDetails"));
const SignIn = lazy(() => import(/* webpackChunkName: "signin" */ "@/pages/SignIn"));
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ "@/pages/Dashboard"));
const Announcements = lazy(() => import(/* webpackChunkName: "announcements" */ "@/pages/Announcements"));
const AnnouncementDetails = lazy(() => import(/* webpackChunkName: "announcement-details" */ "@/pages/AnnouncementDetails"));
const UserManagement = lazy(() => import(/* webpackChunkName: "user-management" */ "@/pages/UserManagement"));
const AuthTest = lazy(() => import(/* webpackChunkName: "auth-test" */ "@/pages/AuthTest"));
// Projects section
const Projects = lazy(() => import(/* webpackChunkName: "projects" */ "@/pages/ProjectsSimple"));
const ProjectDetails = lazy(() => import(/* webpackChunkName: "project-details" */ "@/pages/ProjectDetailFixed"));
const ProjectManagement = lazy(() => import(/* webpackChunkName: "project-management" */ "@/pages/ProjectManagement"));
// Blog and content marketing pages
const BlogPage = lazy(() => import(/* webpackChunkName: "blog" */ "@/pages/BlogPage"));
const ArticlePage = lazy(() => import(/* webpackChunkName: "article" */ "@/pages/ArticlePage"));
const NotFound = lazy(() => import(/* webpackChunkName: "not-found" */ "@/pages/not-found"));
const TestPage = lazy(() => import(/* webpackChunkName: "test" */ "@/pages/TestPage"));

// Simplified routes configuration with optimized route matching
const routes = [
  { path: "/", Component: Home },
  { path: "/properties", Component: Properties },
  { path: "/properties/:id", Component: PropertyDetails },
  { path: "/international", Component: InternationalProperties },
  { path: "/contact", Component: Contact },
  { path: "/about", Component: About },
  { path: "/services", Component: Services },
  { path: "/services/:serviceType", Component: ServiceDetails },
  { path: "/signin", Component: SignIn },
  { path: "/dashboard", Component: Dashboard },
  { path: "/announcements", Component: Announcements },
  { path: "/announcements/:id", Component: AnnouncementDetails },
  { path: "/projects", Component: Projects },
  { path: "/projects/:id", Component: ProjectDetails },
  { path: "/test", Component: TestPage },
  { path: "/blog", Component: BlogPage },
  { path: "/blog/:slug", Component: ArticlePage }
];

function Router() {
  // Track page views when routes change
  useAnalytics();

  // Preload critical routes to improve perceived performance
  const preloadCriticalRoutes = () => {
    // Use specific imports instead of dynamic route variables to avoid Vite warnings
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        // Using /* @vite-ignore */ to suppress warnings for dynamic imports
        // These are just preloads, so it's fine if they don't all succeed
        import(/* @vite-ignore */ '@/pages/Home');
        import(/* @vite-ignore */ '@/pages/PropertyDetails');
        import(/* @vite-ignore */ '@/pages/AnnouncementDetails');
      });
    }
  };

  // Trigger preload on idle and clear image cache to ensure fresh images
  useEffect(() => {
    // Clear image cache on app mount to ensure fresh images
    clearImageCache();
    preloadCriticalRoutes();
  }, []);

  return (
    <Switch>
      {/* Standard public routes */}
      <Route path="/">
        <Suspense fallback={<LoadingFallback />}>
          <Home />
        </Suspense>
      </Route>
      <Route path="/properties">
        <Suspense fallback={<LoadingFallback />}>
          <Properties />
        </Suspense>
      </Route>
      <Route path="/properties/:id">
        <Suspense fallback={<LoadingFallback />}>
          <PropertyDetails />
        </Suspense>
      </Route>
      <Route path="/international">
        <Suspense fallback={<LoadingFallback />}>
          <InternationalProperties />
        </Suspense>
      </Route>
      <Route path="/contact">
        <Suspense fallback={<LoadingFallback />}>
          <Contact />
        </Suspense>
      </Route>
      <Route path="/about">
        <Suspense fallback={<LoadingFallback />}>
          <About />
        </Suspense>
      </Route>
      <Route path="/services">
        <Suspense fallback={<LoadingFallback />}>
          <Services />
        </Suspense>
      </Route>
      <Route path="/services/:serviceType">
        <Suspense fallback={<LoadingFallback />}>
          <ServiceDetails />
        </Suspense>
      </Route>
      <Route path="/signin">
        <Suspense fallback={<LoadingFallback />}>
          <SignIn />
        </Suspense>
      </Route>
      <Route path="/announcements">
        <Suspense fallback={<LoadingFallback />}>
          <Announcements />
        </Suspense>
      </Route>
      <Route path="/announcements/:id">
        <Suspense fallback={<LoadingFallback />}>
          <AnnouncementDetails />
        </Suspense>
      </Route>

      {/* Projects section */}
      <Route path="/projects">
        <Suspense fallback={<LoadingFallback />}>
          <Projects />
        </Suspense>
      </Route>
      <Route path="/projects/:id">
        <Suspense fallback={<LoadingFallback />}>
          <ProjectDetails />
        </Suspense>
      </Route>

      {/* Authentication test page */}
      <Route path="/auth-test">
        <Suspense fallback={<LoadingFallback />}>
          <AuthTest />
        </Suspense>
      </Route>

      {/* Protected routes - simplified implementation */}
      <Route path="/dashboard">
        <Suspense fallback={<LoadingFallback />}>
          <Dashboard />
        </Suspense>
      </Route>

      <ProtectedRoute 
        path="/user-management" 
        component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <UserManagement />
          </Suspense>
        )}
        requiredRole={['owner', 'admin']}
      />

      <ProtectedRoute 
        path="/project-management" 
        component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <ProjectManagement />
          </Suspense>
        )}
        requiredRole={['owner', 'admin']}
      />

      {/* Fallback to 404 */}
      <Route>
        <Suspense fallback={<LoadingFallback />}>
          <NotFound />
        </Suspense>
      </Route>
    </Switch>
  );
}

function ErrorFallback({error, resetErrorBoundary}: {error: Error; resetErrorBoundary: () => void}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded shadow-lg">
        <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <pre className="text-sm bg-gray-100 p-4 rounded mb-4">{error.message}</pre>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [updateRegistration, setUpdateRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Initialize analytics
    initGA();

    // Initialize performance monitoring
    //initPerformanceMonitoring();

    // Track initial page view
    //trackPageView(window.location.pathname);

    // PWA Installation prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // PWA Update detection
    const handleServiceWorkerUpdate = () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

        navigator.serviceWorker.register('/sw.js').then((registration) => {
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setUpdateRegistration(registration);
                  setShowUpdatePrompt(true);
                }
              });
            }
          });
        });
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    handleServiceWorkerUpdate();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleUpdateClick = () => {
    if (updateRegistration && updateRegistration.waiting) {
      updateRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setShowUpdatePrompt(false);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            {showInstallPrompt && (
              <div className="fixed top-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Download className="h-6 w-6 text-gold-accent" />
                    <div>
                      <h3 className="font-semibold text-sm">Install The Views</h3>
                      <p className="text-xs text-gray-600 mt-1">Get quick access to properties and faster loading</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInstallPrompt(false)}
                    className="h-auto p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex space-x-2 mt-3">
                  <Button onClick={handleInstallClick} size="sm" className="text-xs">
                    Install
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowInstallPrompt(false)} className="text-xs">
                    Not now
                  </Button>
                </div>
              </div>
            )}

            {showUpdatePrompt && (
              <div className="fixed top-4 right-4 z-50 bg-blue-50 border border-blue-300 rounded-lg shadow-lg p-4 max-w-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="h-6 w-6 text-blue-600" />
                    <div>
                      <h3 className="font-semibold text-sm">Update Available</h3>
                      <p className="text-xs text-gray-600 mt-1">A new version is ready with improvements</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUpdatePrompt(false)}
                    className="h-auto p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex space-x-2 mt-3">
                  <Button onClick={handleUpdateClick} size="sm" className="text-xs">
                    Update
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowUpdatePrompt(false)} className="text-xs">
                    Later
                  </Button>
                </div>
              </div>
            )}
            <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
              <Router />
            </Suspense>
            <Toaster />
          </div>
        </AuthProvider>
        <OfflineIndicator />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;