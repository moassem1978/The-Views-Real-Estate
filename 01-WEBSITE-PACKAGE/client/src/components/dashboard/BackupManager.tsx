
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface BackupStatus {
  isScheduled: boolean;
  totalBackups: number;
  latestBackup: string | null;
  diskUsage: number;
  lastDailyBackup: string | null;
  lastWeeklyBackup: string | null;
}

export function BackupManager() {
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [backups, setBackups] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBackupStatus();
    loadBackupList();
  }, []);

  const loadBackupStatus = async () => {
    try {
      const response = await fetch('/api/admin/backup/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to load backup status:', error);
    }
  };

  const loadBackupList = async () => {
    try {
      const response = await fetch('/api/admin/backup/list');
      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups || []);
      }
    } catch (error) {
      console.error('Failed to load backup list:', error);
    }
  };

  const createManualBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'manual' })
      });

      if (response.ok) {
        toast({
          title: "Backup Created",
          description: "Manual backup has been created successfully.",
        });
        await loadBackupStatus();
        await loadBackupList();
      } else {
        throw new Error('Failed to create backup');
      }
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to create manual backup.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (filename: string | null) => {
    if (!filename) return 'Never';
    const match = filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (match) {
      return new Date(match[1]).toLocaleDateString();
    }
    return 'Unknown';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Backup System Status
            <Badge variant={status?.isScheduled ? "default" : "destructive"}>
              {status?.isScheduled ? "Active" : "Inactive"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{status.totalBackups}</div>
                <div className="text-sm text-gray-600">Total Backups</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{formatBytes(status.diskUsage)}</div>
                <div className="text-sm text-gray-600">Disk Usage</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{formatDate(status.lastDailyBackup)}</div>
                <div className="text-sm text-gray-600">Last Daily</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{formatDate(status.lastWeeklyBackup)}</div>
                <div className="text-sm text-gray-600">Last Weekly</div>
              </div>
            </div>
          )}
          
          <div className="flex gap-4">
            <Button 
              onClick={createManualBackup}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Manual Backup'}
            </Button>
            <Button 
              onClick={() => { loadBackupStatus(); loadBackupList(); }}
              variant="outline"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium">Daily Backup</div>
                <div className="text-sm text-gray-600">Every day at 2:00 AM</div>
              </div>
              <Badge variant="outline">Automated</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium">Weekly Comprehensive Backup</div>
                <div className="text-sm text-gray-600">Every Sunday at 3:00 AM</div>
              </div>
              <Badge variant="outline">Automated</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div>
                <div className="font-medium">Health Check & Emergency Backup</div>
                <div className="text-sm text-gray-600">Every hour</div>
              </div>
              <Badge variant="outline">Automated</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div>
                <div className="font-medium">Cleanup Old Backups</div>
                <div className="text-sm text-gray-600">Every day at 4:00 AM</div>
              </div>
              <Badge variant="outline">Automated</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Backups ({backups.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {backups.length > 0 ? (
              backups.slice(0, 10).map((backup, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded">
                  <span className="font-mono text-sm">{backup}</span>
                  <Badge variant={backup.includes('emergency') ? 'destructive' : 
                                backup.includes('weekly') ? 'secondary' : 'default'}>
                    {backup.includes('emergency') ? 'Emergency' :
                     backup.includes('weekly') ? 'Weekly' :
                     backup.includes('daily') ? 'Daily' : 'Manual'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">No backups available</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
