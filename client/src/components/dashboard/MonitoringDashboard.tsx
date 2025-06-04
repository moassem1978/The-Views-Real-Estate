
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Database,
  Server,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import FrontendMonitoring from '@/lib/monitoring';

interface SystemHealth {
  sentry: boolean;
  sendgrid: boolean;
  database: boolean;
  backups: boolean;
  lastBackup?: string;
  errorCount: number;
}

export function MonitoringDashboard() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSystemHealth = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('/api/system/health');
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      } else {
        throw new Error('Failed to fetch system health');
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
      FrontendMonitoring.captureError(error instanceof Error ? error : new Error(String(error)), 'monitoring_dashboard');
      toast({
        title: 'Error',
        description: 'Failed to fetch system health data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const testEmailAlert = async () => {
    try {
      const response = await apiRequest('/api/monitoring/test-email', {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Test email sent successfully',
        });
      } else {
        throw new Error('Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test email',
        variant: 'destructive',
      });
    }
  };

  const testSentryAlert = async () => {
    try {
      // Test Sentry by capturing a test error
      FrontendMonitoring.captureMessage('Test monitoring alert from dashboard', 'info', 'test');
      
      toast({
        title: 'Success',
        description: 'Test Sentry alert sent',
      });
    } catch (error) {
      console.error('Error sending test Sentry alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to send test Sentry alert',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchSystemHealth();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading system health...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Monitoring</h2>
        <Button onClick={fetchSystemHealth} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sentry Monitoring</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {health?.sentry ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <Badge variant={health?.sentry ? "default" : "destructive"}>
                {health?.sentry ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Alerts</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {health?.sendgrid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <Badge variant={health?.sendgrid ? "default" : "destructive"}>
                {health?.sendgrid ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {health?.database ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <Badge variant={health?.database ? "default" : "destructive"}>
                {health?.database ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backup System</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {health?.backups ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <Badge variant={health?.backups ? "default" : "destructive"}>
                {health?.backups ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {health?.lastBackup && (
              <p className="text-xs text-muted-foreground mt-1">
                Last: {new Date(health.lastBackup).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error Count Alert */}
      {health && health.errorCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {health.errorCount} error(s) detected in the last 24 hours. Check the Error Tracking section for details.
          </AlertDescription>
        </Alert>
      )}

      {/* Test Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Test Monitoring Systems</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <Button onClick={testEmailAlert} variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Test Email Alert
            </Button>
            <Button onClick={testSentryAlert} variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Test Sentry Alert
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Use these buttons to test that your monitoring systems are working correctly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default MonitoringDashboard;
