
// Core Web Vitals monitoring for SEO
export function initPerformanceMonitoring() {
  // Web Vitals tracking
  if ('web-vital' in window) return; // Prevent duplicate loading
  
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/web-vitals@3/dist/web-vitals.attribution.iife.js';
  script.onload = () => {
    if (window.webVitals) {
      // Track Core Web Vitals
      window.webVitals.onCLS(sendToAnalytics);
      window.webVitals.onFID(sendToAnalytics);
      window.webVitals.onLCP(sendToAnalytics);
      window.webVitals.onFCP(sendToAnalytics);
      window.webVitals.onTTFB(sendToAnalytics);
    }
  };
  document.head.appendChild(script);
}

function sendToAnalytics(metric: any) {
  // Send to Google Analytics 4
  if (window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }
  
  console.log('Web Vital:', metric.name, metric.value);
}

// Image optimization
export function optimizeImages() {
  const images = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
}

declare global {
  interface Window {
    webVitals: any;
    gtag: any;
  }
}
