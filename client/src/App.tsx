import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { IconsProvider } from "@/components/ui/IconsProvider";

// Using optimized loading pattern for all routes to reduce bundle size
const LoadingFallback = () => (
  <div className="container mx-auto px-4 py-8">
    <Skeleton className="h-12 w-48 mb-4" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-64 w-full rounded-lg" />
      ))}
    </div>
  </div>
);

// Using optimized code splitting for all routes
const Home = lazy(() => import("@/pages/Home"));
const Properties = lazy(() => import("@/pages/Properties"));
const PropertyDetails = lazy(() => import("@/pages/PropertyDetails"));
const Contact = lazy(() => import("@/pages/Contact"));
const About = lazy(() => import("@/pages/About"));
const Services = lazy(() => import("@/pages/Services"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Routes configuration 
const routes = [
  { path: "/", Component: Home },
  { path: "/properties", Component: Properties },
  { path: "/properties/:id", Component: PropertyDetails },
  { path: "/contact", Component: Contact },
  { path: "/about", Component: About },
  { path: "/services", Component: Services },
  { path: "/signin", Component: SignIn },
  { path: "/dashboard", Component: Dashboard }
];

function Router() {
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
