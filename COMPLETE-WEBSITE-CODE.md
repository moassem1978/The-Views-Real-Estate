# Complete Website Code - Current Implementation

## 1. Enhanced Mobile Header Component

**File: `client/src/components/layout/Header.tsx`**

```tsx
import { useState } from "react";
import { Link } from "wouter";
import { Menu, X, ChevronDown, ChevronUp, Phone, Mail, Search } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPropertiesOpen, setPropertiesOpen] = useState(false);
  const [isServicesOpen, setServicesOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setPropertiesOpen(false);
    setServicesOpen(false);
  };

  return (
    <header className="bg-white shadow-sm z-50 relative">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <img src="/logo.png" alt="The Views Logo" className="h-10 w-auto object-contain" />
          <div>
            <h1 className="text-xl font-serif font-bold text-[#B87333] leading-none">The Views</h1>
            <p className="text-xs text-gray-700 tracking-wide">REAL ESTATE</p>
          </div>
        </Link>

        {/* Hamburger Toggle */}
        <button
          className="md:hidden text-[#B87333]"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-6 text-sm text-gray-700 font-medium">
          <Link href="/">Home</Link>
          <Link href="/properties">Properties</Link>
          <Link href="/services">Services</Link>
          <Link href="/projects">Projects</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
      </div>

      {/* Full Screen Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 md:hidden">
          {/* Header with Logo and Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="The Views Logo" className="h-8 w-auto object-contain" />
              <div>
                <h1 className="text-lg font-serif font-bold text-[#B87333] leading-none">The Views</h1>
                <p className="text-xs text-gray-700 tracking-wide">REAL ESTATE</p>
              </div>
            </div>
            <button
              onClick={closeMobileMenu}
              className="text-[#B87333]"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Menu Content */}
          <div className="flex flex-col h-full">
            <nav className="flex-1 px-4 py-6 space-y-6">
              {/* Home */}
              <Link 
                href="/" 
                onClick={closeMobileMenu}
                className="block text-lg font-medium text-gray-900 py-2"
              >
                Home
              </Link>

              {/* Properties with Submenu */}
              <div>
                <button
                  onClick={() => setPropertiesOpen(!isPropertiesOpen)}
                  className="flex items-center justify-between w-full text-lg font-medium text-gray-900 py-2"
                >
                  Properties
                  {isPropertiesOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {isPropertiesOpen && (
                  <div className="ml-4 mt-2 space-y-3">
                    <Link 
                      href="/properties?type=Primary" 
                      onClick={closeMobileMenu}
                      className="block text-gray-700 py-1"
                    >
                      Primary
                    </Link>
                    <Link 
                      href="/properties?type=Resale" 
                      onClick={closeMobileMenu}
                      className="block text-gray-700 py-1"
                    >
                      Resale
                    </Link>
                    <Link 
                      href="/international" 
                      onClick={closeMobileMenu}
                      className="block text-gray-700 py-1"
                    >
                      International
                    </Link>
                  </div>
                )}
              </div>

              {/* Services with Submenu */}
              <div>
                <button
                  onClick={() => setServicesOpen(!isServicesOpen)}
                  className="flex items-center justify-between w-full text-lg font-medium text-gray-900 py-2"
                >
                  Services
                  {isServicesOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                {isServicesOpen && (
                  <div className="ml-4 mt-2 space-y-3">
                    <Link 
                      href="/services/buyer-representation" 
                      onClick={closeMobileMenu}
                      className="block text-gray-700 py-1"
                    >
                      Buyer Representation
                    </Link>
                    <Link 
                      href="/services/seller-representation" 
                      onClick={closeMobileMenu}
                      className="block text-gray-700 py-1"
                    >
                      Seller Representation
                    </Link>
                    <Link 
                      href="/services/investment" 
                      onClick={closeMobileMenu}
                      className="block text-gray-700 py-1"
                    >
                      Investment Consultation
                    </Link>
                  </div>
                )}
              </div>

              {/* Other Menu Items */}
              <Link 
                href="/projects" 
                onClick={closeMobileMenu}
                className="block text-lg font-medium text-gray-900 py-2"
              >
                Projects
              </Link>
              
              <Link 
                href="/about" 
                onClick={closeMobileMenu}
                className="block text-lg font-medium text-gray-900 py-2"
              >
                About
              </Link>
              
              <Link 
                href="/contact" 
                onClick={closeMobileMenu}
                className="block text-lg font-medium text-gray-900 py-2"
              >
                Contact
              </Link>

              {/* Sign In Button */}
              <Link 
                href="/otp-login" 
                onClick={closeMobileMenu}
                className="flex items-center text-[#B87333] font-medium py-2"
              >
                <span className="mr-2">🔑</span>
                Sign In
              </Link>
            </nav>

            {/* Footer Section */}
            <div className="px-4 py-6 border-t border-gray-200 space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                <a 
                  href="tel:01063111136" 
                  className="flex items-center text-gray-700"
                >
                  <Phone size={16} className="mr-2" />
                  01063111136
                </a>
                <a 
                  href="mailto:Sales@theviewsrealestate.com" 
                  className="flex items-center text-gray-700"
                >
                  <Mail size={16} className="mr-2" />
                  Sales@theviewsrealestate.com
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Link 
                  href="/otp-login" 
                  onClick={closeMobileMenu}
                  className="bg-[#B87333] text-white px-4 py-2 rounded font-medium"
                >
                  Sign In
                </Link>
                <button className="p-2 border border-gray-300 rounded">
                  <Search size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Social Media */}
              <div className="flex space-x-4">
                <a href="#" className="text-blue-600">
                  <span className="text-xl">f</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
```

## 2. Fixed Dashboard Component with Defensive Array Checks

**File: `client/src/pages/Dashboard.tsx`**

```tsx
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
                    {Array.isArray(properties) ? properties.length : 0}
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
                    {Array.isArray(properties) && properties.filter((p: any) => p.listingType === 'Primary').length}
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
                    {Array.isArray(properties) && properties.filter((p: any) => p.listingType === 'Resale').length}
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
                  {Array.isArray(properties) && properties.length > 0 ? (
                    properties.slice(0, 5).map((property: Property) => (
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
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No properties yet. Add your first property to get started.
                    </p>
                  )}
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
                ) : !Array.isArray(properties) || properties.length === 0 ? (
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
```

## 3. Protected PropertyList Component

**File: `client/src/components/properties/PropertyList.tsx`**

Key section with defensive filtering:

```tsx
// Filter properties based on search with defensive array check
const filteredProperties = Array.isArray(properties) 
  ? properties.filter(property =>
      property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.propertyType && property.propertyType.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  : [];

// Apply max items limit if specified
const displayProperties = maxItems 
  ? filteredProperties.slice(0, maxItems)
  : filteredProperties;
```

## 4. Key Architecture Features

### Frontend Stack:
- React 18 with TypeScript
- Tailwind CSS for styling  
- Wouter for routing
- React Query for data fetching
- Shadcn/ui components
- Lucide React icons

### Backend Stack:
- Express.js server
- PostgreSQL database
- Drizzle ORM
- Passport.js authentication
- Multer for file uploads
- SendGrid for email

### Security Features:
- OTP-based authentication
- Session management
- Role-based access control
- Image upload validation
- SQL injection protection

### Mobile Features:
- Full-screen navigation overlay
- Collapsible submenus
- Touch-friendly interactions
- Responsive design
- Bronze branding theme

All array operations are now protected with defensive checks to prevent runtime errors from undefined or null data.