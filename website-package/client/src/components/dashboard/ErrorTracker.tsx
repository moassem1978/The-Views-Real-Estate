import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface ErrorLog {
  timestamp: string;
  context: string;
  userId: string;
  message: string;
  stack?: string;
}

export function ErrorTracker() {
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const { toast } = useToast();

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('/api/error-logs');
      if (response.ok) {
        const data = await response.json();
        setErrors(data.logs || []);
      } else {
        toast({
          title: 'Failed to load error logs',
          description: 'You may not have sufficient permissions to view this data.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching error logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch error logs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearErrors = async () => {
    if (!confirm('Are you sure you want to clear all error logs? This action cannot be undone.')) {
      return;
    }

    setClearing(true);
    try {
      const response = await apiRequest('/api/error-logs/clear', {
        method: 'POST',
      });
      if (response.ok) {
        setErrors([]);
        toast({
          title: 'Success',
          description: 'Error logs have been cleared.',
        });
      } else {
        toast({
          title: 'Failed to clear error logs',
          description: 'You may not have sufficient permissions for this action.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error clearing logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear error logs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setClearing(false);
    }
  };

  // Parse an error log string into a more structured format
  const parseErrorLog = (log: string): ErrorLog => {
    try {
      const timestampMatch = log.match(/\[(.*?)\]/);
      const contextMatch = log.match(/\[(.*?)\]\[(.*?)\]/);
      const userMatch = log.match(/\[User:(.*?)\]/);
      
      let message = log;
      let stack = '';
      
      // Extract stack trace if it exists
      if (log.includes('Stack:')) {
        const parts = log.split('Stack:');
        message = parts[0].trim();
        stack = parts[1].trim();
      }
      
      // Remove the prefixes from the message
      if (timestampMatch && contextMatch && userMatch) {
        message = message.replace(/\[.*?\]\[.*?\]\[User:.*?\]/, '').trim();
      }
      
      return {
        timestamp: timestampMatch ? timestampMatch[1] : 'Unknown time',
        context: contextMatch ? contextMatch[2] : 'Unknown',
        userId: userMatch ? userMatch[1] : 'anonymous',
        message,
        stack
      };
    } catch (error) {
      console.error('Error parsing log entry:', error);
      return {
        timestamp: 'Parse error',
        context: 'Parse error',
        userId: 'unknown',
        message: log
      };
    }
  };
  
  useEffect(() => {
    fetchErrors();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Error Tracking System</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={fetchErrors} 
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="destructive" 
            onClick={clearErrors} 
            disabled={clearing || errors.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading error logs...</div>
        </div>
      ) : errors.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 pb-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-xl font-medium">No error logs found</p>
            <p className="text-sm text-muted-foreground mt-2">
              This is good news! The system is running smoothly with no recorded errors.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Showing {errors.length} errors from most recent to oldest
          </div>
          
          {errors.map((error, index) => {
            const parsed = parseErrorLog(error);
            return (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-muted/50 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">
                      Error in {parsed.context}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {parsed.timestamp}
                    </div>
                  </div>
                  <CardDescription>
                    User: {parsed.userId}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="font-medium text-destructive">
                    {parsed.message}
                  </div>
                  {parsed.stack && (
                    <>
                      <Separator className="my-3" />
                      <div className="text-xs overflow-x-auto whitespace-pre-wrap font-mono text-muted-foreground">
                        {parsed.stack}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}