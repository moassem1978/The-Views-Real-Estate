
import React, { useState, useEffect } from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { Alert, AlertDescription } from './alert';
import { Wifi, WifiOff, Clock, RefreshCw } from 'lucide-react';
import { offlineManager } from '@/lib/offline-manager';
import { useToast } from '@/hooks/use-toast';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(offlineManager.getOnlineStatus());
  const [pendingCount, setPendingCount] = useState(offlineManager.getPendingActionsCount());
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = offlineManager.addListener((online) => {
      setIsOnline(online);
      setPendingCount(offlineManager.getPendingActionsCount());
      
      if (online) {
        toast({
          title: "🌐 Back Online",
          description: "Connection restored. Syncing pending changes...",
        });
      } else {
        toast({
          title: "📴 Offline Mode",
          description: "Your changes will be saved and synced when connection returns.",
          variant: "destructive",
        });
      }
    });

    // Update pending count periodically
    const interval = setInterval(() => {
      setPendingCount(offlineManager.getPendingActionsCount());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [toast]);

  if (isOnline && pendingCount === 0) {
    return null; // Don't show anything when online and no pending actions
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <div className="flex items-center space-x-2">
        <Badge 
          variant={isOnline ? "default" : "destructive"}
          className="flex items-center space-x-1"
        >
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </Badge>

        {pendingCount > 0 && (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{pendingCount} pending</span>
          </Badge>
        )}

        {(pendingCount > 0 || !isOnline) && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
          >
            Details
          </Button>
        )}
      </div>

      {showDetails && (
        <Alert className="w-80">
          <AlertDescription>
            {!isOnline && (
              <div className="mb-2">
                <strong>📴 Offline Mode Active</strong>
                <p className="text-sm text-muted-foreground">
                  You're currently offline. All changes are being saved locally 
                  and will sync automatically when connection is restored.
                </p>
              </div>
            )}

            {pendingCount > 0 && (
              <div className="mb-2">
                <strong>⏳ {pendingCount} Actions Pending Sync</strong>
                <p className="text-sm text-muted-foreground">
                  These changes will be uploaded when you're back online.
                </p>
              </div>
            )}

            <div className="flex space-x-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
              
              {pendingCount > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    offlineManager.clearPendingActions();
                    setPendingCount(0);
                    toast({
                      title: "Cleared",
                      description: "Pending actions cleared",
                    });
                  }}
                >
                  Clear Pending
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
