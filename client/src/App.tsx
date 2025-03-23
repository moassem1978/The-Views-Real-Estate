import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import React, { lazy, Suspense, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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
const Contact = lazy(() => import(/* webpackChunkName: "contact" */ "@/pages/Contact"));
const About = lazy(() => import(/* webpackChunkName: "about" */ "@/pages/About"));
const Services = lazy(() => import(/* webpackChunkName: "services" */ "@/pages/Services"));
const SignIn = lazy(() => import(/* webpackChunkName: "signin" */ "@/pages/SignIn"));
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ "@/pages/Dashboard"));
const Announcements = lazy(() => import(/* webpackChunkName: "announcements" */ "@/pages/Announcements"));
const AnnouncementDetails = lazy(() => import(/* webpackChunkName: "announcement-details" */ "@/pages/AnnouncementDetails"));
const NotFound = lazy(() => import(/* webpackChunkName: "not-found" */ "@/pages/not-found"));

// Simplified routes configuration with optimized route matching
const routes = [
  { path: "/", Component: Home },
  { path: "/properties", Component: Properties },
  { path: "/properties/:id", Component: PropertyDetails },
  { path: "/contact", Component: Contact },
  { path: "/about", Component: About },
  { path: "/services", Component: Services },
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

  // Trigger preload on idle
  useEffect(() => {
    preloadCriticalRoutes();
  }, []);

  return (
    <Switch>
      {routes.map(({ path, Component }) => (
        <Route key={path} path={path}>
          <Suspense fallback={<LoadingFallback />}>
            <Component />
          </Suspense>
        </Route>
      ))}
      
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
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
