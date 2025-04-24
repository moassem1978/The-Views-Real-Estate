import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import React, { lazy, Suspense, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { clearImageCache } from "./lib/utils";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

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
// Projects section removed as requested
const NotFound = lazy(() => import(/* webpackChunkName: "not-found" */ "@/pages/not-found"));

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
  { path: "/announcements/:id", Component: AnnouncementDetails }
];

function Router() {
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

      {/* Projects section removed as requested */}
      
      {/* Authentication test page */}
      <Route path="/auth-test">
        <Suspense fallback={<LoadingFallback />}>
          <AuthTest />
        </Suspense>
      </Route>
      
      {/* Protected routes */}
      <ProtectedRoute 
        path="/dashboard" 
        component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <Dashboard />
          </Suspense>
        )}
        requiredRole={['owner', 'admin', 'user']} 
      />
      
      <ProtectedRoute 
        path="/user-management" 
        component={() => (
          <Suspense fallback={<LoadingFallback />}>
            <UserManagement />
          </Suspense>
        )}
        requiredRole={['owner', 'admin']}
      />
      
      {/* Project management route removed as requested */}
      
      {/* Fallback to 404 */}
      <Route>
        <Suspense fallback={<LoadingFallback />}>
          <NotFound />
        </Suspense>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
