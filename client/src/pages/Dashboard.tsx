import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, AlertCircle, Loader2, Home, Building2, FileText, Users, Settings,
  PlusCircle, ClipboardEdit, List, Star, X, Plus
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

// Dashboard component with full management functionality
function Dashboard() {
  console.log("Dashboard component rendering");
  const { user, isLoading: authLoading } = useAuth();
  console.log("Auth context loaded:", !!user);
  
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | undefined>(undefined);
  
  // Dashboard state
  const [state, setState] = useState({
    userExists: !!user,
    isLoading: authLoading,
    hasError: false
  });
  console.log("Dashboard state:", state);
  
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
  
  // Authentication context
  const { isLoading, error } = useAuth();
    
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
    <div className="dashboard-container">
      <div className="container mx-auto p-4 md:p-8 dashboard-content">
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
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
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
            
            {/* Dashboard Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription>Welcome to the Dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Please use the tabs above to navigate to different sections:</p>
                <ul className="list-disc list-inside mt-4 space-y-2">
                  <li>Use the <strong>Properties</strong> tab to manage all property listings</li>
                  <li>Use the <strong>Announcements</strong> tab to manage site announcements</li>
                  <li>Use the <strong>Projects</strong> tab to manage development projects</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Properties Tab - SIMPLIFIED with ONE interface */}
          <TabsContent value="properties" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Building2 className="mr-2 h-5 w-5 text-[#B87333]" />
                    <span>Property Management</span>
                  </div>
                  <Button 
                    className="bg-[#B87333] hover:bg-[#964B00]"
                    onClick={() => setShowPropertyModal(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Property
                  </Button>
                </CardTitle>
                <CardDescription>
                  Manage all property listings from a single interface
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
                <CardTitle>Announcements Management</CardTitle>
                <CardDescription>
                  Create and manage announcements for the website.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">Announcement management interface coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Projects Management</CardTitle>
                <CardDescription>
                  Create and manage projects for property listings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">Project management interface coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
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
        
        {/* Property Form Modal */}
        <Dialog open={showPropertyModal} onOpenChange={setShowPropertyModal}>
          <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>{selectedPropertyId ? "Edit Property" : "Add New Property"}</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto pr-1">
              <PropertyForm 
                propertyId={selectedPropertyId} 
                onSuccess={handlePropertyFormClose}
                onCancel={handlePropertyFormClose}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default Dashboard;