
import * as Sentry from '@sentry/node';
import sgMail from '@sendgrid/mail';
import { errorLogger } from './error-logger';

class MonitoringService {
  private static instance: MonitoringService;
  private isInitialized = false;

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  public initialize() {
    if (this.isInitialized) return;

    // Initialize Sentry
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
        integrations: [
          Sentry.httpIntegration(),
          Sentry.prismaIntegration(),
          Sentry.postgresIntegration(),
        ],
        beforeSend(event) {
          // Filter out non-critical errors
          if (event.exception?.values?.[0]?.value?.includes('Image not found:')) {
            return null;
          }
          if (event.exception?.values?.[0]?.value?.includes('ENOENT')) {
            return null;
          }
          return event;
        }
      });
      console.log('✅ Sentry monitoring initialized');
    } else {
      console.log('⚠️ Sentry DSN not found, monitoring disabled');
    }

    // Initialize SendGrid
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      console.log('✅ SendGrid email monitoring initialized');
    } else {
      console.log('⚠️ SendGrid API key not found, email alerts disabled');
    }

    this.isInitialized = true;
  }

  public captureError(error: Error | string, context: string = 'general', userId?: number | string) {
    try {
      // Log to our error logger
      errorLogger.logError(error, context, userId);

      // Send to Sentry if available
      if (process.env.SENTRY_DSN) {
        Sentry.withScope((scope) => {
          scope.setTag('context', context);
          if (userId) {
            scope.setUser({ id: String(userId) });
          }
          scope.setLevel('error');
          
          if (error instanceof Error) {
            Sentry.captureException(error);
          } else {
            Sentry.captureMessage(String(error), 'error');
          }
        });
      }

      // Send critical error alerts via email
      this.sendCriticalErrorAlert(error, context, userId);
    } catch (monitoringError) {
      console.error('Monitoring service error:', monitoringError);
    }
  }

  public captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: string) {
    try {
      if (process.env.SENTRY_DSN) {
        Sentry.withScope((scope) => {
          if (context) {
            scope.setTag('context', context);
          }
          scope.setLevel(level);
          Sentry.captureMessage(message, level);
        });
      }
      
      if (level === 'error') {
        console.error(`[${context || 'MONITOR'}] ${message}`);
      } else if (level === 'warning') {
        console.warn(`[${context || 'MONITOR'}] ${message}`);
      } else {
        console.log(`[${context || 'MONITOR'}] ${message}`);
      }
    } catch (error) {
      console.error('Error capturing message:', error);
    }
  }

  private async sendCriticalErrorAlert(error: Error | string, context: string, userId?: number | string) {
    // Only send email for critical contexts
    const criticalContexts = ['database', 'backup', 'auth', 'deployment', 'server_crash'];
    
    if (!criticalContexts.includes(context) || !process.env.SENDGRID_API_KEY) {
      return;
    }

    try {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      const timestamp = new Date().toISOString();

      const msg = {
        to: 'Assem@theviewsconsultancy.com',
        from: 'alerts@theviewsconsultancy.com',
        subject: `🚨 Critical Error Alert - ${context.toUpperCase()}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 2px solid #dc2626; border-radius: 5px;">
            <h2 style="color: #dc2626; margin-bottom: 20px;">🚨 Critical System Error</h2>
            
            <div style="background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Context:</strong> ${context}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${timestamp}</p>
              <p style="margin: 5px 0;"><strong>User ID:</strong> ${userId || 'Anonymous'}</p>
              <p style="margin: 5px 0;"><strong>Error:</strong> ${errorMessage}</p>
            </div>
            
            ${errorStack ? `
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h4>Stack Trace:</h4>
                <pre style="font-size: 12px; white-space: pre-wrap;">${errorStack}</pre>
              </div>
            ` : ''}
            
            <p style="margin-top: 20px; color: #666;">
              This is an automated alert from The Views Real Estate monitoring system.
              Please investigate immediately.
            </p>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`Critical error alert sent for context: ${context}`);
    } catch (emailError) {
      console.error('Failed to send critical error alert:', emailError);
    }
  }

  public async sendBackupAlert(type: 'success' | 'failure', details: string) {
    if (!process.env.SENDGRID_API_KEY) return;

    try {
      const isSuccess = type === 'success';
      const msg = {
        to: 'Assem@theviewsconsultancy.com',
        from: 'alerts@theviewsconsultancy.com',
        subject: `${isSuccess ? '✅' : '❌'} Backup ${isSuccess ? 'Completed' : 'Failed'} - ${new Date().toDateString()}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 2px solid ${isSuccess ? '#16a34a' : '#dc2626'}; border-radius: 5px;">
            <h2 style="color: ${isSuccess ? '#16a34a' : '#dc2626'}; margin-bottom: 20px;">
              ${isSuccess ? '✅' : '❌'} Database Backup ${isSuccess ? 'Completed' : 'Failed'}
            </h2>
            
            <div style="background-color: ${isSuccess ? '#f0fdf4' : '#fef2f2'}; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toISOString()}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${type.toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Details:</strong> ${details}</p>
            </div>
            
            <p style="margin-top: 20px; color: #666;">
              This is an automated notification from The Views Real Estate backup system.
            </p>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`Backup ${type} alert sent`);
    } catch (error) {
      console.error('Failed to send backup alert:', error);
    }
  }

  public async sendMaintenanceAlert(message: string, level: 'info' | 'warning' | 'critical' = 'info') {
    if (!process.env.SENDGRID_API_KEY) return;

    const colors = {
      info: '#3b82f6',
      warning: '#f59e0b',
      critical: '#dc2626'
    };

    const icons = {
      info: 'ℹ️',
      warning: '⚠️',
      critical: '🚨'
    };

    try {
      const msg = {
        to: 'Assem@theviewsconsultancy.com',
        from: 'alerts@theviewsconsultancy.com',
        subject: `${icons[level]} System Maintenance Alert - ${level.toUpperCase()}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 2px solid ${colors[level]}; border-radius: 5px;">
            <h2 style="color: ${colors[level]}; margin-bottom: 20px;">
              ${icons[level]} System Maintenance Alert
            </h2>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Level:</strong> ${level.toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toISOString()}</p>
              <p style="margin: 5px 0;"><strong>Message:</strong> ${message}</p>
            </div>
            
            <p style="margin-top: 20px; color: #666;">
              This is an automated maintenance notification from The Views Real Estate system.
            </p>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`Maintenance alert sent: ${level}`);
    } catch (error) {
      console.error('Failed to send maintenance alert:', error);
    }
  }
}

export const monitoringService = MonitoringService.getInstance();
