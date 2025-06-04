import React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import FrontendMonitoring from "@/lib/monitoring";
import App from "./App";
import "./index.css";

// Initialize monitoring as early as possible
FrontendMonitoring.initialize();

// Mount the application with optimized hydration
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

// Create a root for concurrent mode rendering
const root = createRoot(rootElement);

// Render the app
root.render(<App />);

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful');
    }).catch(err => {
      console.log('ServiceWorker registration failed:', err);
    });
  });
}

// Register a minimal analytics function
const sendPageView = () => {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      console.log(`Page view: ${window.location.pathname}`);
    });
  } else {
    setTimeout(() => {
      console.log(`Page view: ${window.location.pathname}`);
    }, 1000);
  }
};

// Listen for route changes to track page views
window.addEventListener('popstate', sendPageView);