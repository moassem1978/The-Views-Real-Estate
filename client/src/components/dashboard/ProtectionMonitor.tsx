
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Clock, Download, Upload } from 'lucide-react';

interface Backup {
  name: string;
  timestamp: string;
  operation: string;
}

interface Change {
  timestamp: string;
  username: string;
  operation: string;
  success: boolean;
  error?: string;
}

export default function ProtectionMonitor() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [backupsRes, changesRes] = await Promise.all([
        fetch('/api/backups'),
        fetch('/api/changes')
      ]);

      if (backupsRes.ok) {
        const backupsData = await backupsRes.json();
        setBackups(backupsData.backups || []);
      }

      if (changesRes.ok) {
        const changesData = await changesRes.json();
        setChanges(changesData.changes || []);
      }
    } catch (error) {
      console.error('Failed to fetch protection data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    try {
      const response = await fetch('/api/backups/create', { method: 'POST' });
      if (response.ok) {
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  };

  const restoreBackup = async (backupFile: string) => {
    if (!confirm(`Are you sure you want to restore from ${backupFile}? This will overwrite current data.`)) {
      return;
    }

    try {
      const response = await fetch('/api/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupFile })
      });

      if (response.ok) {
        alert('Backup restored successfully');
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
    }
  };

  if (loading) {
    return <div>Loading protection monitor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold">Protection Monitor</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backups Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Automatic Backups
            </CardTitle>
            <Button onClick={createBackup} size="sm">
              Create Manual Backup
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {backups.slice(0, 10).map((backup, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium text-sm">{backup.name}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(backup.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => restoreBackup(backup.name)}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Restore
                  </Button>
                </div>
              ))}
              {backups.length === 0 && (
                <p className="text-gray-500 text-sm">No backups available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Changes Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {changes.slice(0, 10).map((change, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium text-sm">
                      {change.username} - {change.operation}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(change.timestamp).toLocaleString()}
                    </div>
                    {change.error && (
                      <div className="text-xs text-red-500">{change.error}</div>
                    )}
                  </div>
                  <Badge variant={change.success ? "default" : "destructive"}>
                    {change.success ? "Success" : "Failed"}
                  </Badge>
                </div>
              ))}
              {changes.length === 0 && (
                <p className="text-gray-500 text-sm">No recent changes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Protection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Protection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm">Auto Backup</div>
              <div className="text-xs text-gray-500">Before dangerous operations</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm">Owner Protection</div>
              <div className="text-xs text-gray-500">Critical ops require owner</div>
            </div>
            <div className="text-center p-4 border rounded">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm">Change Tracking</div>
              <div className="text-xs text-gray-500">All changes logged</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
