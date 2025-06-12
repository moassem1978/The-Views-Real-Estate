import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { 
  Image as ImageIcon, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Search,
  RefreshCw,
  Database,
  HardDrive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PhotoIntegrityResult {
  valid: boolean;
  issues: string[];
}

interface CleanupResult {
  success: boolean;
  cleaned: number;
  errors: string[];
}

interface PropertyPhoto {
  propertyId: number;
  propertyTitle: string;
  photoCount: number;
  hasIssues: boolean;
  issues: string[];
}

export default function PhotoDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [validatingProperty, setValidatingProperty] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all properties with photo data
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['/api/properties'],
    select: (data: any) => {
      return data.data?.map((property: any) => ({
        propertyId: property.id,
        propertyTitle: property.title,
        photoCount: Array.isArray(property.photos) ? property.photos.length : 0,
        hasIssues: false,
        issues: []
      })) || [];
    }
  });

  // Cleanup orphaned files mutation
  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/photos/cleanup', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Cleanup failed: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (data: CleanupResult) => {
      toast({
        title: "Cleanup completed",
        description: `Removed ${data.cleaned} orphaned files`
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cleanup failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Validate photo integrity for a property
  const validateProperty = async (propertyId: number) => {
    setValidatingProperty(propertyId);
    
    try {
      const response = await fetch(`/api/photos/property/${propertyId}/validate`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Validation failed');
      }
      
      const result: PhotoIntegrityResult = await response.json();
      
      if (result.valid) {
        toast({
          title: "Validation complete",
          description: "All photos are valid"
        });
      } else {
        toast({
          title: "Issues found",
          description: `${result.issues.length} issues detected`,
          variant: "destructive"
        });
      }
      
      return result;
    } catch (error) {
      toast({
        title: "Validation error",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
      return { valid: false, issues: ['Validation failed'] };
    } finally {
      setValidatingProperty(null);
    }
  };

  // Rebuild photo associations
  const rebuildAssociations = async () => {
    try {
      const response = await fetch('/api/photos/rebuild-associations', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Rebuild failed');
      }
      
      const result = await response.json();
      
      toast({
        title: "Rebuild complete",
        description: `Restored ${result.restoredCount} photo associations`
      });
      
      // Refresh properties data
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
    } catch (error) {
      toast({
        title: "Rebuild failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  // Filter properties based on search term
  const filteredProperties = properties.filter((property: PropertyPhoto) =>
    property.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Photo Management Dashboard</h2>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold">{properties.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Total Photos</p>
                <p className="text-2xl font-bold">
                  {properties.reduce((sum: number, p: PropertyPhoto) => sum + p.photoCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Properties with Photos</p>
                <p className="text-2xl font-bold">
                  {properties.filter((p: PropertyPhoto) => p.photoCount > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle>System Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => cleanupMutation.mutate()}
              disabled={cleanupMutation.isPending}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {cleanupMutation.isPending ? 'Cleaning...' : 'Cleanup Orphaned Files'}
            </Button>
            
            <Button
              onClick={rebuildAssociations}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Rebuild Photo Associations
            </Button>
          </div>
          
          {cleanupMutation.isPending && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cleaning up orphaned files...</span>
              </div>
              <Progress value={50} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Search */}
      <Card>
        <CardHeader>
          <CardTitle>Property Photo Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Properties List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4">Loading properties...</div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {searchTerm ? 'No properties match your search' : 'No properties found'}
              </div>
            ) : (
              filteredProperties.map((property: PropertyPhoto) => (
                <div
                  key={property.propertyId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{property.propertyTitle}</h4>
                      <Badge variant={property.photoCount > 0 ? "default" : "secondary"}>
                        {property.photoCount} photos
                      </Badge>
                      {property.hasIssues && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Issues
                        </Badge>
                      )}
                    </div>
                    {property.issues.length > 0 && (
                      <div className="mt-1">
                        {property.issues.map((issue, index) => (
                          <p key={index} className="text-sm text-red-600">
                            {issue}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => validateProperty(property.propertyId)}
                      disabled={validatingProperty === property.propertyId}
                      className="flex items-center gap-1"
                    >
                      {validatingProperty === property.propertyId ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : property.hasIssues ? (
                        <XCircle className="h-3 w-3" />
                      ) : (
                        <CheckCircle className="h-3 w-3" />
                      )}
                      Validate
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Photo Integrity Information */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Use this dashboard to monitor photo integrity, clean up orphaned files, and maintain 
          the photo-property associations. Regular maintenance ensures optimal performance and 
          prevents broken image references.
        </AlertDescription>
      </Alert>
    </div>
  );
}