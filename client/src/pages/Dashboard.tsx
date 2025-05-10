import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, AlertCircle, Loader2, Home, Building2, FileText, Users, Settings,
  PlusCircle, ClipboardEdit, List, Star, X
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";

// Dashboard components
import PropertiesManager from "@/components/dashboard/PropertiesManager";
import PropertyForm from "@/components/dashboard/PropertyForm";

// Dashboard component with full management functionality
function Dashboard() {
  console.log("Dashboard component rendering");
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>(undefined);
  
  // Property form handlers
  const handlePropertyEdit = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
    setShowPropertyModal(true);
  };
  
  const handlePropertyFormClose = () => {
    setShowPropertyModal(false);
    setSelectedPropertyId(undefined);
  };
  
  // Define sections based on role permissions
  const getSections = (role: string) => {
    const sections = [
      { id: "overview", label: "Overview", icon: <Home className="h-4 w-4 mr-2" /> },
      { id: "properties", label: "Properties", icon: <Building2 className="h-4 w-4 mr-2" /> },
      { id: "announcements", label: "Announcements", icon: <FileText className="h-4 w-4 mr-2" /> },
      { id: "projects", label: "Projects", icon: <ClipboardEdit className="h-4 w-4 mr-2" /> },
    ];
    
    // Only owner and admin can manage users
    if (role === 'owner' || role === 'admin') {
      sections.push({ id: "users", label: "User Management", icon: <Users className="h-4 w-4 mr-2" /> });
    }
    
    // Only owner can access settings
    if (role === 'owner') {
      sections.push({ id: "settings", label: "Site Settings", icon: <Settings className="h-4 w-4 mr-2" /> });
    }
    
    return sections;
  };
  
  try {
    // Access authentication context
    const auth = useAuth();
    console.log("Auth context loaded:", !!auth);
    const { user, isLoading, error } = auth;
    console.log("Dashboard state:", { userExists: !!user, isLoading, hasError: !!error });
    
    // Set up sections once user is loaded
    useEffect(() => {
      if (user) {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab');
        if (tabParam) {
          setActiveTab(tabParam);
        }
      }
    }, [user]);
    
    // Display loading state
    if (isLoading) {
      return (
        <div className="container mx-auto p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      );
    }
    
    // Display error state
    if (error) {
      return (
        <div className="container mx-auto p-8">
          <h2 className="text-xl font-bold mb-4">Error</h2>
          <p className="mb-4">{error.message || "Unknown error"}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      );
    }
    
    // Authentication check
    if (!user) {
      return (
        <div className="container mx-auto p-8">
          <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
          <p className="mb-4">Please sign in to access the dashboard</p>
          <Link to="/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      );
    }
    
    // Get sections based on user role
    const sections = getSections(user.role);
    
    // Handle tab change
    const handleTabChange = (value: string) => {
      setActiveTab(value);
      window.history.replaceState(null, '', `?tab=${value}`);
    };
    
    // Main dashboard content with tabs for different management sections
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <Link to="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Site
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center">
            <span className="mr-2">Logged in as:</span>
            <span className="font-medium">{user.fullName || user.username}</span>
            <span className="ml-2 px-2 py-1 text-xs bg-slate-200 text-slate-800 rounded-full capitalize">
              {user.role}
            </span>
          </div>
        </div>
        
        {/* iOS Upload Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-center mb-3 sm:mb-0">
              <div className="mr-3 bg-amber-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                  <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
                  <path d="M12 18h.01" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-amber-800">iOS Upload Tool</h3>
                <p className="text-amber-700">Using an iOS device? Use our dedicated iOS image uploader for better compatibility.</p>
              </div>
            </div>
            <div>
              <a 
                href="/ios-upload.html" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center justify-center px-4 py-2 rounded-md font-medium bg-amber-600 text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Open iOS Upload Tool
              </a>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
            {sections.map((section) => (
              <TabsTrigger 
                key={section.id} 
                value={section.id}
                className="flex items-center justify-center"
              >
                {section.icon}
                <span className="hidden md:inline">{section.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Welcome, {user.fullName || user.username}</CardTitle>
                <CardDescription>
                  This is your dashboard where you can manage all aspects of The Views Real Estate platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DashboardStatCard 
                    title="Properties" 
                    value="39" 
                    description="Total properties" 
                    icon={<Building2 className="h-5 w-5" />}
                    linkTo="/dashboard?tab=properties" 
                  />
                  <DashboardStatCard 
                    title="Announcements" 
                    value="1" 
                    description="Active announcements" 
                    icon={<FileText className="h-5 w-5" />}
                    linkTo="/dashboard?tab=announcements" 
                  />
                  <DashboardStatCard 
                    title="Projects" 
                    value="5+" 
                    description="Active projects" 
                    icon={<ClipboardEdit className="h-5 w-5" />}
                    linkTo="/dashboard?tab=projects" 
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Universal Forms Banner */}
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-800">
                  <AlertCircle className="inline-block mr-2 h-5 w-5 text-amber-600" />
                  Universal Forms for Cross-Platform Compatibility
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Having trouble with forms on Windows? Use these universal tools that work on all platforms.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 h-auto py-4"
                    onClick={() => window.open('/windows-property.html', '_blank')}
                  >
                    <Building2 className="mr-2 h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Universal Property Form</span>
                      <span className="text-xs text-left opacity-90">Create & Edit Properties on any device</span>
                    </div>
                  </Button>
                  
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 h-auto py-4"
                    onClick={() => window.open('/windows-upload.html', '_blank')}
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Universal Image Uploader</span>
                      <span className="text-xs text-left opacity-90">Upload property images on any device</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* New Cross-Platform Upload Solution */}
            <Card className="bg-green-50 border-green-200 mb-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-800">
                  <AlertCircle className="inline-block mr-2 h-5 w-5 text-green-600" />
                  NEW! Universal Cross-Platform Image Uploader
                </CardTitle>
                <CardDescription className="text-green-700">
                  Having trouble uploading images on iOS or other devices? Try our new universal uploader that works on all platforms.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="bg-green-600 hover:bg-green-700 h-auto py-4 w-full"
                  onClick={() => window.open('/universal-upload.html', '_blank')}
                >
                  <AlertCircle className="mr-2 h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Open Cross-Platform Uploader</span>
                    <span className="text-xs text-left opacity-90">Works on iOS, Windows, Mac, and all other devices</span>
                  </div>
                </Button>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 gap-2">
                    <Link to="/dashboard?tab=properties">
                      <Button variant="outline" className="w-full justify-start">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Property
                      </Button>
                    </Link>
                    <Link to="/dashboard?tab=announcements">
                      <Button variant="outline" className="w-full justify-start">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Announcement
                      </Button>
                    </Link>
                    <Link to="/dashboard?tab=projects">
                      <Button variant="outline" className="w-full justify-start">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Project
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Featured Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link to="/dashboard?tab=properties">
                      <Button variant="outline" className="w-full justify-start">
                        <Star className="mr-2 h-4 w-4" />
                        Manage Featured Properties
                      </Button>
                    </Link>
                    <Link to="/dashboard?tab=announcements">
                      <Button variant="outline" className="w-full justify-start">
                        <Star className="mr-2 h-4 w-4" />
                        Manage Highlighted Announcements
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-4">
            {/* Add/Edit Property Banner */}
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-800">
                  <Building2 className="inline-block mr-2 h-5 w-5 text-amber-600" />
                  Create or Update Properties
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Use this button to add new properties or edit existing ones. All your property management in one place.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    className="bg-[#B87333] hover:bg-[#964B00] h-auto py-4"
                    onClick={() => setShowPropertyModal(true)}
                  >
                    <Building2 className="mr-2 h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Property Management</span>
                      <span className="text-xs text-left opacity-90">Add new properties or edit existing ones</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Properties Management</CardTitle>
                <CardDescription>
                  Add, edit, or remove property listings from the website.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PropertiesManager onEditProperty={handlePropertyEdit} />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Announcements Tab */}
          <TabsContent value="announcements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Announcements Management</span>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Announcement
                  </Button>
                </CardTitle>
                <CardDescription>
                  Create and manage announcements for the website.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">Announcement management interface coming soon...</p>
                  <Link to="/announcements">
                    <Button variant="outline">
                      <List className="mr-2 h-4 w-4" />
                      View Announcements
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            {/* Universal Forms Banner for Projects Tab */}
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-800">
                  <AlertCircle className="inline-block mr-2 h-5 w-5 text-amber-600" />
                  Universal Project Management Form
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Windows users: Use this universal tool for creating and managing projects on any platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 h-auto py-4"
                    onClick={() => window.open('/windows-project.html', '_blank')}
                  >
                    <ClipboardEdit className="mr-2 h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span className="font-medium">Universal Project Management Form</span>
                      <span className="text-xs text-left opacity-90">Create, edit and manage development projects on any device</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Projects Management</span>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Project
                  </Button>
                </CardTitle>
                <CardDescription>
                  Create and manage projects for property listings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">Project management interface coming soon...</p>
                  <Link to="/projects">
                    <Button variant="outline">
                      <List className="mr-2 h-4 w-4" />
                      View Projects
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>User Management</span>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </CardTitle>
                <CardDescription>
                  Manage users and their roles.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">User management interface coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Site Settings</CardTitle>
                <CardDescription>
                  Configure global settings for the website.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">Settings interface coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  } catch (e) {
    // Fallback error handling
    console.error("Dashboard render error:", e);
    return (
      <div className="container mx-auto p-8 text-center">
        <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
        <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
        <p className="mb-4">There was an error rendering the dashboard</p>
        <div className="flex justify-center gap-4">
          <Link to="/">
            <Button variant="outline">Return Home</Button>
          </Link>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }
}

// Stat card component for dashboard
interface DashboardStatCardProps {
  title: string;
  value: string;
  description: string;
  icon?: React.ReactNode;
  linkTo?: string;
}

function DashboardStatCard({ title, value, description, icon, linkTo }: DashboardStatCardProps) {
  const content = (
    <Card className="h-full hover:border-[#B87333] transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      {linkTo && (
        <CardFooter className="pt-0">
          <Button variant="link" className="p-0 h-auto font-normal text-[#B87333]">
            View details &rarr;
          </Button>
        </CardFooter>
      )}
    </Card>
  );
  
  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }
  
  return content;
}

// Export with error boundary
export default Dashboard;