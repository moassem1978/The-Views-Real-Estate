import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { HelmetProvider } from "react-helmet-async";

// Lightweight error handling
function initializeApp() {
  console.log("✅ App initializing...");
}

// Basic error handlers
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});

// Initialize the app
initializeApp();
const container = document.getElementById("root");
if (!container) {
  console.error("Root element not found");
  throw new Error("Root element not found");
}

try {
  const root = createRoot(container);
  root.render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </HelmetProvider>
  );
  console.log("✅ React app rendered successfully");
} catch (error) {
  console.error("❌ Failed to render React app:", error);

  // Fallback: Show error message
  container.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif; color: #dc2626;">
      <h1>Application Loading Error</h1>
      <p>The application failed to load. Please refresh the page or contact support.</p>
      <details style="margin-top: 10px;">
        <summary>Error Details</summary>
        <pre style="background: #f3f4f6; padding: 10px; border-radius: 4px; overflow: auto;">
${error instanceof Error ? error.stack : String(error)}
        </pre>
      </details>
    </div>
  `;
}

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