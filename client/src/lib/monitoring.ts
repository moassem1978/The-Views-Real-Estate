
import * as Sentry from '@sentry/react';

class FrontendMonitoring {
  private static initialized = false;

  static initialize() {
    if (this.initialized) return;

    // Simple initialization without blocking
    try {
      const sentryDsn = import.meta.env.VITE_SENTRY_DSN || import.meta.env.VITE_PUBLIC_SENTRY_DSN;
      
      if (sentryDsn) {
        // Async initialization to prevent blocking
        setTimeout(() => {
          try {
            Sentry.init({
              dsn: sentryDsn,
              environment: import.meta.env.MODE || 'development',
              integrations: [
                Sentry.browserTracingIntegration(),
              ],
              tracesSampleRate: 0.1,
              beforeSend(event) {
                if (event.exception?.values?.[0]?.value?.includes('Non-Error promise rejection')) {
                  return null;
                }
                return event;
              }
            });
            console.log('Frontend monitoring initialized');
          } catch (e) {
            console.warn('Monitoring init failed:', e);
          }
        }, 50);
      }
    } catch (error) {
      console.warn('Monitoring setup failed:', error);
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
