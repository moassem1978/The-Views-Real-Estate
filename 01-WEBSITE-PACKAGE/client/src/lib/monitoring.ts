
import * as Sentry from '@sentry/react';

class FrontendMonitoring {
  private static initialized = false;

  static initialize() {
    if (this.initialized) return;

    const sentryDsn = import.meta.env.VITE_SENTRY_DSN || import.meta.env.VITE_PUBLIC_SENTRY_DSN;
    
    if (sentryDsn) {
      Sentry.init({
        dsn: sentryDsn,
        environment: import.meta.env.MODE || 'development',
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        beforeSend(event) {
          // Filter out non-critical errors
          if (event.exception?.values?.[0]?.value?.includes('Non-Error promise rejection')) {
            return null;
          }
          if (event.exception?.values?.[0]?.value?.includes('Failed to fetch')) {
            return null;
          }
          return event;
        }
      });
      
      console.log('✅ Frontend Sentry monitoring initialized');
    } else {
      console.log('⚠️ Frontend Sentry DSN not found, monitoring disabled');
    }

    this.initialized = true;
  }

  static captureError(error: Error | string, context?: string, userId?: string) {
    try {
      if (!this.initialized) this.initialize();

      Sentry.withScope((scope) => {
        if (context) {
          scope.setTag('context', context);
        }
        if (userId) {
          scope.setUser({ id: userId });
        }
        scope.setLevel('error');
        
        if (error instanceof Error) {
          Sentry.captureException(error);
        } else {
          Sentry.captureMessage(String(error), 'error');
        }
      });
    } catch (monitoringError) {
      console.error('Frontend monitoring error:', monitoringError);
    }
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: string) {
    try {
      if (!this.initialized) this.initialize();

      Sentry.withScope((scope) => {
        if (context) {
          scope.setTag('context', context);
        }
        scope.setLevel(level);
        Sentry.captureMessage(message, level);
      });
    } catch (error) {
      console.error('Error capturing frontend message:', error);
    }
  }

  static setUser(userId: string, email?: string, username?: string) {
    if (!this.initialized) this.initialize();
    
    Sentry.setUser({
      id: userId,
      email,
      username
    });
  }

  static clearUser() {
    if (!this.initialized) this.initialize();
    Sentry.setUser(null);
  }
}

export default FrontendMonitoring;
