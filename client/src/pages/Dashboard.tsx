import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Home, Settings, BarChart3 } from 'lucide-react';
import PropertyForm from '@/components/dashboard/PropertyForm';

interface Property {
  id: number;
  title: string;
  price: string;
  location: string;
  images: string[];
  createdAt: string;
  listingType?: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties');
      const result = await response.json();
      return result.data || [];
    }
  });

  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const response = await fetch('/api/user');
      if (!response.ok) throw new Error('Not authenticated');
      return response.json();
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-gray-600">Please log in to access the dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.fullName || user.username}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="add-property" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Property
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-amber-700">
                    {properties.length}
                  </div>
                  <p className="text-sm text-gray-600">Active listings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Primary Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {Array.isArray(properties) ? properties.filter((p: any) => p.listingType === 'Primary').length : 0}
                  </div>
                  <p className="text-sm text-gray-600">New developments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resale Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {Array.isArray(properties) ? properties.filter((p: any) => p.listingType === 'Resale').length : 0}
                  </div>
                  <p className="text-sm text-gray-600">Resale properties</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.isArray(properties) && properties.slice(0, 5).map((property: Property) => (
                    <div key={property.id} className="flex items-center justify-between py-2 border-b">
                      <div>
                        <p className="font-medium">{property.title}</p>
                        <p className="text-sm text-gray-600">{property.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-amber-700">{property.price}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(property.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {!Array.isArray(properties) || properties.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No properties yet. Add your first property to get started.
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Properties</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading properties...</div>
                ) : properties.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No properties found.</p>
                    <Button onClick={() => setActiveTab('add-property')} className="bg-amber-700 hover:bg-amber-800">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Property
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property: Property) => (
                      <Card key={property.id} className="overflow-hidden">
                        <div className="aspect-video bg-gray-200">
                          {property.images && property.images.length > 0 ? (
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <Home className="w-12 h-12" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-2">{property.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{property.location}</p>
                          <p className="font-bold text-amber-700">{property.price}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-property">
            <PropertyForm />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <div className="p-2 bg-gray-100 rounded">{user.username}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <div className="p-2 bg-gray-100 rounded">{user.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Role</label>
                    <div className="p-2 bg-gray-100 rounded capitalize">{user.role}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}