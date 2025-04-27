import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

// Extremely simplified dashboard to fix rendering issues
function Dashboard() {
  console.log("Dashboard component rendering");
  
  try {
    // Access authentication context
    const auth = useAuth();
    console.log("Auth context loaded:", !!auth);
    const { user, isLoading, error } = auth;
    console.log("Dashboard state:", { userExists: !!user, isLoading, hasError: !!error });
    
    // Display loading state
    if (isLoading) {
      return (
        <div className="container mx-auto p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
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
    
    // Main dashboard content (basic version)
    return (
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome, {user.username}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Dashboard functionality is currently under maintenance.</p>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/properties">
            <Card className="h-full hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle>Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <p>View all property listings</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to="/announcements">
            <Card className="h-full hover:bg-gray-50 transition-colors">
              <CardHeader>
                <CardTitle>Announcements</CardTitle>
              </CardHeader>
              <CardContent>
                <p>View all announcements</p>
              </CardContent>
            </Card>
          </Link>
        </div>
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

// Export with error boundary
export default Dashboard;