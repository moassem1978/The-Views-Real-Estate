
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, User, Calendar, Filter, Download } from 'lucide-react';

interface AuditEvent {
  timestamp: string;
  userId: number;
  username: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: number;
  details: any;
  success: boolean;
  errorMessage?: string;
}

export default function AuditTrail() {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    resource: '',
    username: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAuditTrail();
  }, []);

  const fetchAuditTrail = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/audit-trail?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        setAuditEvents(data);
      }
    } catch (error) {
      console.error('Error fetching audit trail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes('DELETE')) return 'destructive';
    if (action.includes('UPDATE') || action.includes('MODIFY')) return 'default';
    if (action.includes('CREATE') || action.includes('ADD')) return 'secondary';
    return 'outline';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      case 'user': return 'outline';
      default: return 'outline';
    }
  };

  const criticalActions = ['PROPERTY_DELETE', 'IMAGE_DELETE', 'BULK_IMAGE_DELETE'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Select value={filters.action} onValueChange={(value) => setFilters({...filters, action: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Actions</SelectItem>
                <SelectItem value="PROPERTY_UPDATE">Property Updates</SelectItem>
                <SelectItem value="PROPERTY_DELETE">Property Deletions</SelectItem>
                <SelectItem value="IMAGE_DELETE">Image Deletions</SelectItem>
                <SelectItem value="USER_LOGIN">User Logins</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.resource} onValueChange={(value) => setFilters({...filters, resource: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Resources</SelectItem>
                <SelectItem value="property">Properties</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="user">Users</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Username"
              value={filters.username}
              onChange={(e) => setFilters({...filters, username: e.target.value})}
            />

            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />

            <div className="flex gap-2">
              <Button onClick={fetchAuditTrail} variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Apply
              </Button>
              <Button 
                onClick={() => setFilters({action: '', resource: '', username: '', startDate: '', endDate: ''})}
                variant="ghost" 
                size="sm"
              >
                Clear
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading audit trail...</div>
          ) : (
            <div className="space-y-3">
              {auditEvents.map((event, index) => (
                <Card key={index} className={`${criticalActions.includes(event.action) ? 'border-red-200 bg-red-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {criticalActions.includes(event.action) && (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{event.username}</span>
                            <Badge variant={getRoleBadgeColor(event.userRole)}>
                              {event.userRole}
                            </Badge>
                            <Badge variant={getActionBadgeColor(event.action)}>
                              {event.action}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              on {event.resource}
                              {event.resourceId && ` #${event.resourceId}`}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            {new Date(event.timestamp).toLocaleString()}
                          </div>
                          {event.details && (
                            <div className="text-xs text-gray-400 mt-1">
                              Details: {JSON.stringify(event.details)}
                            </div>
                          )}
                          {!event.success && event.errorMessage && (
                            <div className="text-xs text-red-600 mt-1">
                              Error: {event.errorMessage}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={event.success ? 'secondary' : 'destructive'}>
                        {event.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {auditEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No audit events found for the selected filters.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
