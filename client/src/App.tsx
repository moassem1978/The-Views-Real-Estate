import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Properties from "@/pages/Properties";
import PropertyDetails from "@/pages/PropertyDetails";
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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

// Lazy load less critical routes for better performance
const Contact = lazy(() => import("@/pages/Contact"));
const About = lazy(() => import("@/pages/About"));
const Services = lazy(() => import("@/pages/Services"));
const SignIn = lazy(() => import("@/pages/SignIn"));

function Router() {
  return (
    <Switch>
      {/* Main routes */}
      <Route path="/" component={Home} />
      <Route path="/properties" component={Properties} />
      <Route path="/properties/:id" component={PropertyDetails} />
      
      {/* Lazy-loaded routes */}
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
      <Route path="/signin">
        <Suspense fallback={<LoadingFallback />}>
          <SignIn />
        </Suspense>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
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
